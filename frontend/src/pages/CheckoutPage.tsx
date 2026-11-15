import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Plus, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
} from "../components/ui";
import {
  checkout,
  createAddress,
  createStripeSession,
  getAddresses,
  getDistricts,
  type Address,
  type CreateAddressInput,
  type District,
  type PaymentMethod,
} from "../services/api";
import type { AppDispatch, RootState } from "../store";
import { clearCart } from "../store/slices/cartSlice";

const EMPTY_FORM: CreateAddressInput = {
  label: "Home",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  districtId: "",
};

function CheckoutAlert({ message }: { message: string }) {
  return (
    <div
      className="mb-6 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
      role="alert"
    >
      {message}
    </div>
  );
}

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  // The backend currently charges no shipping fee.
  const total = subtotal;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("STRIPE");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [form, setForm] = useState<CreateAddressInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [addressList, districtList] = await Promise.all([
          getAddresses(),
          getDistricts(),
        ]);

        if (!mounted) {
          return;
        }

        setAddresses(addressList);
        setDistricts(districtList);

        const preferred =
          addressList.find((address) => address.isDefault) ?? addressList[0];
        if (preferred) {
          setSelectedAddressId(preferred.id);
        }
        if (addressList.length === 0) {
          setShowAddressForm(true);
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load checkout details.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const districtOptions = useMemo(
    () =>
      districts.map((district) => ({
        value: district.id,
        label: `${district.name}, ${district.province}`,
      })),
    [districts],
  );

  const handleAddAddress = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSavingAddress(true);

    try {
      const created = await createAddress(form);
      const refreshed = await getAddresses();
      setAddresses(refreshed);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setForm(EMPTY_FORM);
    } catch (saveError) {
      setFormError(
        saveError instanceof Error ? saveError.message : "Could not save address.",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (!selectedAddressId) {
      setError("Select a delivery address before placing the order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const order = await checkout({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (paymentMethod === "STRIPE") {
        const session = await createStripeSession(order.id);
        dispatch(clearCart());
        window.location.href = session.url;
        return;
      }

      dispatch(clearCart());
      navigate(`/orders/${order.id}?payment=cod`, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not place the order.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg text-text-secondary">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* A failed checkout can empty the cart; the reason must still show. */}
          {error && (
            <div className="text-left">
              <CheckoutAlert message={error} />
            </div>
          )}
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Your cart is empty
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Add products to your cart before checking out.
          </p>
          <NavLink to="/browse" className="inline-flex">
            <Button variant="primary" size="lg">
              Continue Shopping
            </Button>
          </NavLink>
          <NavLink to="/cart" className="inline-flex ml-3">
            <Button variant="outline" size="lg">
              View Cart
            </Button>
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Checkout</h1>

        {error && <CheckoutAlert message={error} />}

        <div className="mb-6 flex justify-between items-center">
          <NavLink to="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/90 underline-offset-4">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to Cart
          </NavLink>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery address */}
            <Card variant="outlined">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      selectedAddressId === address.id
                        ? "border-primary bg-primary-light"
                        : "border-border hover:border-text-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <span className="flex-1 text-sm">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-text-primary">
                          {address.recipientName}
                        </span>
                        <Badge variant="outline" size="sm">
                          {address.label}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="primary" size="sm">
                            Default
                          </Badge>
                        )}
                      </span>
                      <span className="mt-1 block text-text-secondary">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                        {address.district.name}, {address.district.province}
                      </span>
                      <span className="block text-text-muted">{address.phone}</span>
                    </span>
                  </label>
                ))}

                {!showAddressForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => setShowAddressForm(true)}
                  >
                    Add another address
                  </Button>
                )}

                {showAddressForm && (
                  <form
                    className="space-y-4 rounded-lg border border-border p-4"
                    onSubmit={handleAddAddress}
                  >
                    <h3 className="font-medium text-text-primary">
                      New address
                    </h3>

                    {formError && (
                      <p className="text-sm text-accent" role="alert">
                        {formError}
                      </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Recipient name"
                        required
                        value={form.recipientName}
                        onChange={(event) =>
                          setForm({ ...form, recipientName: event.target.value })
                        }
                      />
                      <Input
                        label="Phone"
                        required
                        value={form.phone}
                        onChange={(event) =>
                          setForm({ ...form, phone: event.target.value })
                        }
                      />
                    </div>

                    <Input
                      label="Address line 1"
                      required
                      value={form.line1}
                      onChange={(event) =>
                        setForm({ ...form, line1: event.target.value })
                      }
                    />
                    <Input
                      label="Address line 2 (optional)"
                      value={form.line2}
                      onChange={(event) =>
                        setForm({ ...form, line2: event.target.value })
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="City"
                        required
                        value={form.city}
                        onChange={(event) =>
                          setForm({ ...form, city: event.target.value })
                        }
                      />
                      <Select
                        label="District"
                        required
                        placeholder="Select a district"
                        options={districtOptions}
                        value={form.districtId}
                        onChange={(event) =>
                          setForm({ ...form, districtId: event.target.value })
                        }
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={savingAddress}
                      >
                        Save address
                      </Button>
                      {addresses.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Payment method */}
            <Card variant="outlined">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === "STRIPE"
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="STRIPE"
                    checked={paymentMethod === "STRIPE"}
                    onChange={() => setPaymentMethod("STRIPE")}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="flex items-center gap-2 font-medium text-text-primary">
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      Card (Stripe test mode)
                    </span>
                    <span className="mt-1 block text-text-secondary">
                      You will be redirected to Stripe to complete payment. No real
                      money is charged in test mode.
                    </span>
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-text-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="flex items-center gap-2 font-medium text-text-primary">
                      <Truck className="h-4 w-4" aria-hidden="true" />
                      Cash on Delivery
                    </span>
                    <span className="mt-1 block text-text-secondary">
                      Pay in cash when the order is delivered.
                    </span>
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card variant="outlined" className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span className="text-text-secondary">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-text-primary">
                        Rs {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-medium text-text-primary">
                      Rs {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-medium text-text-primary">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span className="text-text-primary">Total</span>
                    <span className="text-text-primary">Rs {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={submitting}
                  onClick={handlePlaceOrder}
                  leftIcon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
                >
                  Place Order
                </Button>

                <p className="text-xs text-text-muted text-center">
                  Secure checkout powered by SajiloMart
                </p>
              </CardContent>
            </Card>

            <div className="mt-6">
              <NavLink to="/cart" className="inline-flex w-full">
                <Button variant="outline" fullWidth>
                  Back to Cart
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
