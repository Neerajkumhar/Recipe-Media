    // src/pages/GroceryListPage.tsx
    import React, { useState } from "react";
    import { useGroceryList } from "../context/GroceryListContext";
    
    import { Plus, Edit, Printer, Share2 } from "lucide-react";

    interface GroceryItem {
    id: string;
    name: string;
    quantity: string;
    }

    const GroceryListPage: React.FC = () => {
    const { groceryList, addIngredient, updateIngredient, removeIngredient } = useGroceryList();

    const [newItemName, setNewItemName] = useState<string>("");
    const [newItemQty, setNewItemQty] = useState<string>("");
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState<string>("");
    const [editQty, setEditQty] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Show success message and clear after 3 seconds
    const showSuccessMessage = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => {
        setSuccessMessage(null);
        }, 3000);
    };

    // Create a new grocery item
    const handleCreate = () => {
        if (!newItemName.trim()) {
        showSuccessMessage("Please enter an item name.");
        return;
        }
        const newId = `${newItemName.trim()}-${Date.now()}`;
        addIngredient({ id: newId, name: newItemName.trim(), quantity: newItemQty.trim() });
        setNewItemName("");
        setNewItemQty("");
        showSuccessMessage("Item successfully added.");
    };

    // Start editing an item
    const startEdit = (item: GroceryItem) => {
        setEditId(item.id);
        setEditName(item.name);
        setEditQty(item.quantity);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
        setEditQty("");
    };

    // Save the edited item
    const handleUpdate = () => {
        if (!editName.trim()) {
        showSuccessMessage("Please enter an item name.");
        return;
        }
        if (editId) {
        updateIngredient(editId, { name: editName.trim(), quantity: editQty.trim() });
        showSuccessMessage("Item successfully updated.");
        cancelEdit();
        }
    };

    // Remove an item
    const handleRemove = (id: string) => {
        removeIngredient(id);
        showSuccessMessage("Item removed.");
        if (editId === id) cancelEdit();
    };

    // Print grocery list
    const handlePrint = () => {
  const printContent = groceryList
    .map(item => `<li>${item.name} - ${item.quantity || "N/A"}</li>`)
    .join("");
  const html = `
    <html>
      <head>
        <title>Grocery List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          ul { list-style: disc; margin-left: 40px; }
        </style>
      </head>
      <body>
        <h1>My Grocery List</h1>
        <ul>${printContent}</ul>
      </body>
    </html>
  `;
  
  const newWindow = window.open("", "_blank");
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  }
};


    // Share grocery list (copy to clipboard)
    const handleShare = async () => {
  const shareText = groceryList
    .map(item => `${item.name} - ${item.quantity || "N/A"}`)
    .join("\n");

  if (navigator.share) {
    try {
      await navigator.share({
        title: "My Grocery List",
        text: shareText,
      });
      alert("Grocery list shared successfully!");
    } catch (error) {
      alert("Sharing failed or was cancelled.");
    }
  } else {
    alert("Web Share API is not supported in your browser.");
  }
};

    return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Grocery List</h1>

        {/* Success message */}
        {successMessage && (
            <p className="mb-4 text-green-700 font-semibold">{successMessage}</p>
        )}

        {/* Create new grocery item form */}
        <div className="flex gap-2 mb-6">
            <input
            type="text"
            placeholder="Item name"
            className="flex-grow px-3 py-2 border rounded"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            aria-label="New item name"
            />
            <input
            type="text"
            placeholder="Quantity (optional)"
            className="w-28 px-3 py-2 border rounded"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            aria-label="New item quantity"
            />
            <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 flex items-center gap-1"
            aria-label="Add grocery item"
            >
            <Plus size={16} /> Add
            </button>
        </div>

        {/* Grocery list */}
        <ul className="space-y-3 mb-8">
            {groceryList.length === 0 && (
            <li className="text-gray-500">No grocery items yet.</li>
            )}

            {groceryList.map((item) =>
            editId === item.id ? (
                <li key={item.id} className="flex gap-2 items-center">
                <input
                    type="text"
                    className="flex-grow px-2 py-1 border rounded"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="Edit item name"
                />
                <input
                    type="text"
                    className="w-28 px-2 py-1 border rounded"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    aria-label="Edit item quantity"
                />
                <button
                    onClick={handleUpdate}
                    className="text-green-600 hover:underline"
                    aria-label="Save grocery item"
                >
                    Save
                </button>
                <button
                    onClick={cancelEdit}
                    className="text-red-600 hover:underline"
                    aria-label="Cancel editing grocery item"
                >
                    Cancel
                </button>
                </li>
            ) : (
                <li key={item.id} className="flex gap-4 items-center justify-between border p-2 rounded shadow-sm bg-white">
                <div>
                    <span className="font-semibold">{item.name}</span>{" "}
                    <span className="text-gray-600">{item.quantity}</span>
                </div>
                <div className="flex gap-2">
                    <button
                    onClick={() => startEdit(item)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                    aria-label={`Edit ${item.name}`}
                    >
                    <Edit size={16} /> Edit
                    </button>
                    <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 hover:underline"
                    aria-label={`Remove ${item.name}`}
                    >
                    Remove
                    </button>
                </div>
                </li>
            )
            )}
        </ul>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center">
            <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            aria-label="Create grocery item"
            >
            <Plus size={18} /> Create
            </button>

            <button
            onClick={handleUpdate}
            disabled={!editId}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
                editId ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 cursor-not-allowed"
            }`}
            aria-label="Update grocery item"
            >
            <Edit size={18} /> Update
            </button>

            <button
            onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-900"
            aria-label="Print grocery list"
            >
            <Printer size={18} /> Print
            </button>

            <button
            onClick={handleShare}
            className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700"
            aria-label="Share grocery list"
            >
            <Share2 size={18} /> Share
            </button>
        </div>
        </div>
    );
    };

    export default GroceryListPage;
