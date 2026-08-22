"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  houseBuilding: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  addressType: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    houseBuilding: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    addressType: "Home",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        setAddresses(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAdding(false);
        setFormData({
          fullName: "",
          phone: "",
          houseBuilding: "",
          street: "",
          city: "",
          state: "",
          pinCode: "",
          country: "India",
          addressType: "Home",
          isDefault: false,
        });
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    fetchAddresses();
  };

  const setDefault = async (address: Address) => {
    await fetch(`/api/user/addresses/${address._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...address, isDefault: true }),
    });
    fetchAddresses();
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "Add New Address"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-2xl border mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="House/Building No."
              required
              value={formData.houseBuilding}
              onChange={(e) => setFormData({ ...formData, houseBuilding: e.target.value })}
            />
            <Input
              placeholder="Street Name"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
            <Input
              placeholder="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              placeholder="State"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              placeholder="PIN Code"
              required
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formData.addressType}
              onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            />
            <label htmlFor="isDefault">Make this my default address</label>
          </div>
          <Button type="submit" className="w-full">Save Address</Button>
        </form>
      )}

      {addresses.length === 0 && !isAdding ? (
        <div className="text-center py-12 text-muted-foreground bg-secondary/30 rounded-2xl">
          You haven't saved any addresses yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address._id} className="border rounded-2xl p-6 relative">
              {address.isDefault && (
                <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  Default
                </span>
              )}
              <h3 className="font-semibold text-lg">{address.fullName}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-2">{address.addressType}</p>
              <div className="text-sm space-y-1">
                <p>{address.houseBuilding}, {address.street}</p>
                <p>{address.city}, {address.state} - {address.pinCode}</p>
                <p>{address.country}</p>
                <p className="mt-2 font-medium">Phone: {address.phone}</p>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                {!address.isDefault && (
                  <button onClick={() => setDefault(address)} className="text-sm font-medium text-primary hover:underline">
                    Set Default
                  </button>
                )}
                <button onClick={() => deleteAddress(address._id)} className="text-sm font-medium text-destructive hover:underline ml-auto">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
