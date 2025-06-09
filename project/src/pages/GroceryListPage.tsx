// src/pages/GroceryListPage.tsx

import React, { useState } from "react";
import { useGroceryList } from "../contexts/GroceryListContext";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
}

const GroceryListPage: React.FC = () => {
  const { items, addItem, removeItem } = useGroceryList();

  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (id) {
      updateIngredient({ id, name, quantity });
    } else {
      const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      addItem({ id: newId, name, quantity });
    }

    setId(null);
    setName("");
    setQuantity("");
    setError("");
  };

  const handleEdit = (item: GroceryItem) => {
    setId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setError("");
  };

  const handlePrint = () => {
    const printContent = items
      .map(
        (item) => `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
          <td style="border: 1px solid #ccc; padding: 8px;">${item.quantity || "N/A"}</td>
        </tr>`
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>Print Grocery List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc; 
              padding: 10px; 
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
          </style>
        </head>
        <body>
          <h1>Grocery List</h1>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${printContent}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const handleShare = async () => {
    const shareText = items
      .map(item => `${item.name} - ${item.quantity || "N/A"}`)
      .join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Grocery List",
          text: shareText,
        });
      } catch {
        // Silently ignore share errors or cancellation
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-6">Grocery Manager</h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            aria-label={id ? "Update grocery item form" : "Create grocery item form"}
          >
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity (optional)
              </label>
              <input
                id="quantity"
                type="text"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && <p className="col-span-2 text-red-600 font-medium">{error}</p>}

            <div className="col-span-2 flex flex-wrap gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                {id ? "Update Item" : "Add Item"}
              </button>
              {id && (
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold transition"
                  onClick={() => {
                    setId(null);
                    setName("");
                    setQuantity("");
                    setError("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-10">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Current Grocery Items</h2>

          {items.length === 0 ? (
            <p className="text-gray-500">No grocery items yet.</p>
          ) : (
            <ul className="space-y-4">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity || "Quantity N/A"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      aria-label={`Edit grocery item ${item.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:underline text-sm flex items-center gap-1"
                      aria-label={`Delete grocery item ${item.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
            aria-label="Print grocery list"
          >
            Print Grocery List
          </button>

          <button
            onClick={handleShare}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold transition"
            aria-label="Share grocery list"
          >
            Share Grocery List
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryListPage;
