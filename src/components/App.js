import React, { useState, useEffect } from "react";

function PlantsyApp() {
  const [plants, setPlants] = useState([]);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantImage, setNewPlantImage] = useState("");
  const [newPlantPrice, setNewPlantPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");

  useEffect(() => {
    fetch("http://localhost:6001/plants")
      .then((response) => response.json())
      .then((data) => setPlants(data));
  }, []);

  const handleAddPlant = (event) => {
    event.preventDefault();
    const newPlant = {
      name: newPlantName,
      image: newPlantImage,
      price: parseFloat(newPlantPrice),
    };

    fetch("http://localhost:6001/plants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPlant),
    })
      .then((response) => response.json())
      .then((addedPlant) => {
        setPlants([...plants, addedPlant]);
      
        setNewPlantName("");
        setNewPlantImage("");
        setNewPlantPrice("");
      });
  };

  const handleSoldOut = (id) => {

    const plantToUpdate = plants.find((plant) => plant.id === id);

    if (plantToUpdate) {
      
      const updatedPlant = { ...plantToUpdate, price: 0 };

      fetch(`http://localhost:6001/plants/${id}`, {
        
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: 0 }), 
      })
        .then((response) => response.json())
        .then((updatedPlantFromServer) => {
          setPlants(
            plants.map((plant) =>
              plant.id === id ? updatedPlantFromServer : plant
            )
          );
        });
    }
  };


  const handleDeletePlant = (id) => {
    fetch(`http://localhost:6001/plants/${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
      
        setPlants(plants.filter((plant) => plant.id !== id));
      } else {
        alert("Failed to delete plant.");
      }
    });
  };


  const handleEditPrice = (id, currentPrice) => {
    setEditingPlantId(id);
    setEditedPrice(currentPrice.toString());
  };

  const handleUpdatePrice = (id) => {
    const newPrice = parseFloat(editedPrice);
    if (isNaN(newPrice)) {
      alert("Please enter a valid price.");
      return;
    }

    fetch(`http://localhost:6001/plants/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ price: newPrice }),
    })
      .then((response) => response.json())
      .then((updatedPlant) => {
        setPlants(
          plants.map((plant) => (plant.id === id ? updatedPlant : plant))
        );
        setEditingPlantId(null); 
        setEditedPrice("");
      });
  };


  const filteredPlants = plants.filter((plant) =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.plantsyApp}>
      <h1 style={styles.heading}>Plantsy</h1>

      {/* New Plant Form */}
      <div style={styles.newPlantForm}>
        <h2 style={styles.newPlantFormTitle}>New Plant</h2>
        <form onSubmit={handleAddPlant} style={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={newPlantName}
            onChange={(e) => setNewPlantName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newPlantImage}
            onChange={(e) => setNewPlantImage(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Price"
            value={newPlantPrice}
            onChange={(e) => setNewPlantPrice(e.target.value)}
            required
            min="0" 
            style={styles.input}
          />
          <button type="submit" style={styles.addButton}>
            Add Plant
          </button>
        </form>
      </div>

      {/* Search Input */}
      <div style={styles.searchPlants}>
        <h2 style={styles.searchPlantsTitle}>Search Plants</h2>
        <input
          type="text"
          placeholder="Type a name to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Plant List */}
      <div style={styles.plantList}>
        {filteredPlants.map((plant) => (
          <div key={plant.id} style={styles.plantCard}>
            <img src={plant.image} alt={plant.name} style={styles.plantImage} />
            <h3 style={styles.plantName}>{plant.name}</h3>
            <p style={styles.plantPrice}>
              Price:
              {editingPlantId === plant.id ? (
                <>
                  <input
                    type="number"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                    style={styles.editPriceInput}
                  />
                  <button
                    onClick={() => handleUpdatePrice(plant.id)}
                    style={styles.updateButton}
                  >
                    Update
                  </button>
                </>
              ) : plant.price === 0 ? (
                <span style={styles.soldOut}>Out of Stock</span>
              ) : (
                <span>{plant.price}</span>
              )}
            </p>
            <div style={styles.actions}>
              <button
                onClick={() => handleSoldOut(plant.id)}
                disabled={plant.price === 0} 
                style={
                  plant.price === 0
                    ? {
                        ...styles.soldOutButton,
                        ...styles.soldOutButtonDisabled,
                      }
                    : styles.soldOutButton
                }
              >
                {plant.price === 0 ? "Sold Out" : "Mark Sold Out"}
              </button>
              <button
                onClick={() => handleDeletePlant(plant.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
              {plant.price > 0 && editingPlantId !== plant.id && (
                <button
                  onClick={() => handleEditPrice(plant.id, plant.price)}
                  style={styles.editButton}
                >
                  Edit Price
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  plantsyApp: {
    fontFamily: "sans-serif",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    color: "#228B22", 
  },
  newPlantForm: {
    backgroundColor: "#f0f0f0",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "8px",
  },
  newPlantFormTitle: {
    marginBottom: "15px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    marginRight: "10px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "200px",
  },
  addButton: {
    padding: "8px 16px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#45a049",
    },
  },
  searchPlants: {
    marginBottom: "20px",
  },
  searchPlantsTitle: {
    color: "#333",
  },
  searchInput: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "300px",
  },
  plantList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  plantCard: {
    backgroundColor: "#fff",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "280px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "translateY(-5px)",
    },
  },
  plantImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "4px",
    marginBottom: "10px",
  },
  plantName: {
    marginBottom: "5px",
    color: "#228B22",
  },
  plantPrice: {
    marginBottom: "10px",
    color: "#555",
    display: "flex", 
    alignItems: "center", 
    gap: "5px", 
    flexWrap: "wrap",
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "10px",
  },

  soldOutButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "white",
    ":hover": {
      backgroundColor: "#c82333",
    },
  },
  soldOutButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "#ccc",
    },
  },
  deleteButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "white",
    ":hover": {
      backgroundColor: "#c82333",
    },
  },
  soldOut: {
    color: "red",
    fontWeight: "bold",
  },
  editButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#007bff", 
    color: "white",
    ":hover": {
      backgroundColor: "#0056b3",
    },
  },
  editPriceInput: {
    padding: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "80px", 
  },
  updateButton: {
    padding: "5px 10px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    ":hover": {
      backgroundColor: "#218838",
    },
  },
};

export default PlantsyApp;
