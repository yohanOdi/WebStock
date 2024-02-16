// Fonction pour vérifier le token JWT au chargement de la page
async function checkTokenValidity() {
    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const response = await fetch('http://192.168.1.86:3000/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                // Redirection automatique vers la page d'accueil si le token est valide
                window.location.href = "accueil.html";
            } else {
                console.error('Le token est invalide ou a expiré:', result.message);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
        }
    }
}

// Soumission du formulaire de connexion
document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Récupérer les valeurs du formulaire
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Envoyer les informations de connexion à votre API
        const response = await fetch('http://192.168.1.86:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: username, password }),
        });

        const result = await response.json();

        if (result.success) {
            // Stocker le token dans le localStorage
            localStorage.setItem('accessToken', result.token);
            console.log('Token JWT stocké avec succès dans le localStorage.');

            // Redirection vers la page principale
            window.location.href = "accueil.html";
        } else {
            // Afficher un message d'erreur à l'utilisateur
            alert("Nom d'utilisateur ou mot de passe incorrect");
        }
    } catch (error) {
        alert('Erreur lors de la connexion');
    }
});

// Vérifier la validité du token au chargement de la page
window.addEventListener('DOMContentLoaded', checkTokenValidity);
