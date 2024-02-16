document.addEventListener("DOMContentLoaded", async () => {
    // Vérification du token
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // Si le token n'est pas présent, rediriger vers la page de connexion
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch('http://192.168.1.86:3000/verifyToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!result.success) {
            // Si le token n'est pas valide, rediriger vers la page de connexion
            window.location.href = "login.html";
            return;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        // En cas d'erreur, rediriger vers la page de connexion par précaution
        window.location.href = "login.html";
        return;
    }
    
    const equipmentList = document.getElementById("equipment-list");

    async function fetchEquipementsByType(type) {
        try {
            const response = await fetch(`http://192.168.1.86:3000/${type}`);
            const result = await response.json();
    
            return { success: result.success, [type]: result[type.toLowerCase()] };
        } catch (error) {
            console.error(`Erreur lors de la récupération des ${type}`, error);
            throw error;
        }
    }    

    async function fetchAndDisplayEquipements(types) {
        const equipementsData = [];
    
        try {
            for (const type of types) {
                const result = await fetchEquipementsByType(type);
    
                if (result && result.success && result[type] && result[type].length > 0) {
                    if (result[type]) {
                        equipementsData.push(...result[type]);
                      }
                } else {
                    alert(`Pas d'équipement trouvé pour le type :  ${type}`);
                }
            }
    
            displayEquipmentList(equipementsData);
        } catch (error) {
            console.error("Erreur lors de la récupération des équipements", error);
        }
    }    

    function displayEquipmentList(data) {

        equipmentList.innerHTML = "";
    
        if (data && Array.isArray(data)) {
            const groupedByType = {};
    
            // Group data by type
            data.forEach(equipment => {
                const type = equipment.nom_type;
                if (!groupedByType[type]) {
                    groupedByType[type] = [];
                }
                groupedByType[type].push(equipment);
            });
    
            // Create HTML for each type
            Object.entries(groupedByType).forEach(([type, equipmentTypeData]) => {
                const typeContainer = createTypeContainer(type);
    
                equipmentTypeData.forEach(equipment => {
                    const equipmentCard = createEquipmentCard(equipment);
                    typeContainer.appendChild(equipmentCard);
                });
    
                equipmentList.appendChild(typeContainer);
            });
        } else {
            console.error("Les données d'équipement ne sont pas définies ou ne sont pas un tableau.");
            return;
        }
    }    
    
    function createTypeContainer(equipmentType) {
        const typeContainer = document.createElement("div");
        typeContainer.classList.add("type-container");
        const typeHeader = document.createElement("h1");
        typeHeader.textContent = `Type: ${equipmentType}`;
        typeContainer.appendChild(typeHeader);
        return typeContainer;
    }
    
    function createEquipmentCard(equipment) {
        const equipmentCard = document.createElement("div");
        equipmentCard.classList.add("equipment-card");
        equipmentCard.innerHTML = getEquipmentCardHTML(equipment);
        addEventListeners(equipmentCard);
        return equipmentCard;
    }

    function getEquipmentCardHTML(equipment) {
        const imageUrl = `picture/${equipment.id_equipement}.jpg`; // Chemin de l'image basé sur l'ID de l'équipement
    
        return `
            <div class="quantity-container">
                <p>Quantité: <span class="quantity" data-id="${equipment.id_equipement}">${equipment.quantite}</span></p>
                <img src="${imageUrl}" alt="${equipment.nom_marque} ${equipment.nom_modele}" class="thumbnail">
                <h3>${equipment.nom_marque} ${equipment.nom_modele}</h3>
                <label for="quantity-input-${equipment.id_equipement}">Quantité:</label>
                <div class="quantity-controls">
                    <button class="btn-increase" data-id="${equipment.id_equipement}">+</button>
                    <input type="number" id="quantity-input-${equipment.id_equipement}" class="quantity" value="${equipment.quantite}">
                    <button class="btn-decrease" data-id="${equipment.id_equipement}">-</button>
                    <br><button class="btn-validate" data-id="${equipment.id_equipement}">Valider</button>
                </div>
            </div>
        `;
    }
    
    function addEventListeners(equipmentCard) {
        const increaseButton = equipmentCard.querySelector(".btn-increase");
        const decreaseButton = equipmentCard.querySelector(".btn-decrease");
        const validateButton = equipmentCard.querySelector(".btn-validate");

        increaseButton.addEventListener("click", increaseQuantity);
        decreaseButton.addEventListener("click", decreaseQuantity);
        validateButton.addEventListener("click", validateEquipment);
    }

    async function validateEquipment() {
        const equipmentId = this.dataset.id;
        const equipmentCard = this.closest(".equipment-card");
        const labelForQuantityInput = equipmentCard.querySelector(`label[for="quantity-input-${equipmentId}"]`);
        const quantitySpan = equipmentCard.querySelector(`.quantity[data-id="${equipmentId}"]`);
        const quantityInput = equipmentCard.querySelector(".quantity-controls input");
        const newQuantity = quantityInput.value;
    
        if (!Number.isInteger(Number(newQuantity))) {
            console.error("La nouvelle quantité n'est pas un nombre entier valide");
            return;
        }
    
        try {
            const response = await fetch("http://192.168.1.86:3000/updateQuantity", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ equipmentId, newQuantity }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                console.log("Quantité mise à jour avec succès");
                updateEquipmentCardAfterValidation(equipmentCard, newQuantity);
                equipmentCard.classList.remove('element-modify'); // Supprime la classe lors de la validation
                equipmentCard.classList.add('element-valid');
            } else {
                console.error("Erreur lors de la mise à jour de la quantité:", result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la quantité", error);
        }
    }    

    function updateEquipmentCardAfterValidation(equipmentCard, newQuantity) {
        const allButtons = equipmentCard.querySelectorAll(".quantity-controls button");
        allButtons.forEach(button => {
            button.style.display = "none";
        });

        const quantityInput = equipmentCard.querySelector(".quantity-controls input");
        quantityInput.remove();

        const labelForQuantityInput = equipmentCard.querySelector(`label[for="${quantityInput.id}"]`);
        labelForQuantityInput.remove();

        const quantitySpan = equipmentCard.querySelector(".quantity");
        quantitySpan.textContent = newQuantity;

        const modifierContainer = document.createElement("div");
        const modifierButton = document.createElement("button");
        modifierButton.textContent = "Modifier";
        modifierButton.classList.add("btn-modifier");
        modifierButton.dataset.id = equipmentCard.querySelector(".btn-validate").dataset.id;

        modifierContainer.appendChild(modifierButton);

        const controlsContainer = equipmentCard.querySelector(".quantity-controls");
        controlsContainer.appendChild(modifierContainer);

        modifierButton.addEventListener("click", modifyEquipment);
    }

    async function modifyEquipment() {
        const equipmentId = this.dataset.id;
        const equipmentCard = this.closest(".equipment-card");
    
        try {
            const response = await fetch(`http://192.168.1.86:3000/equipements/${equipmentId}`);
            const contentType = response.headers.get('content-type');
    
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
    
                if (result.success) {
                    const equipment = result.equipement;
                    equipmentCard.classList.add('element-modify');
                    restoreOriginalCard(equipmentCard, equipment);
                } else {
                    console.error('Erreur lors de la récupération de l\'équipement:', result.message);
                }
            } else {
                console.error('La réponse de l\'API n\'est pas au format JSON');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'équipement', error);
        }
    }    

    function restoreOriginalCard(equipmentCard, equipmentArray) {
    
        if (!equipmentArray || !Array.isArray(equipmentArray) || equipmentArray.length === 0) {
            console.error('donnée invalide:', equipmentArray);
            return;
        }
    
        const equipment = equipmentArray[0];
    
        equipmentCard.innerHTML = getEquipmentCardHTML(equipment);
        addEventListeners(equipmentCard);
    }      

    function increaseQuantity() {
        const equipmentId = this.dataset.id;
        const quantityInput = document.getElementById(`quantity-input-${equipmentId}`);
        const currentQuantity = parseInt(quantityInput.value, 10);
        quantityInput.value = currentQuantity + 1;
    }

    function decreaseQuantity() {
        const equipmentId = this.dataset.id;
        const quantityInput = document.getElementById(`quantity-input-${equipmentId}`);
        const currentQuantity = parseInt(quantityInput.value, 10);
        if (currentQuantity > 0) {
            quantityInput.value = currentQuantity - 1;
        }
    }

    fetchAndDisplayEquipements(["stock30", "imprimante", "platine", "zipette", "batterie", "ecran", "tablette", "cable_rj45", "borne_dect", "carte_dect", "ruban", "toner", "multi_prise", "poste_wind"]);
});
