document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    // Récupérer les valeurs du formulaire
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Envoyer les informations de connexion à votre API
        const response = await fetch('http://127.0.0.1:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: username, password }),
        });

        const result = await response.json();

        if (result.success) {
            // Stocker un cookie de session (ou utiliser une méthode plus sécurisée comme les tokens JWT)
            document.cookie = "session=true";

            // Rediriger vers la page principale
            window.location.href = "accueil.html";
        } else {
            alert("Nom d'utilisateur ou mot de passe incorrect");
        }
    } catch (error) {
        console.error('Erreur lors de la connexion', error);
        alert('Erreur lors de la connexion');
    }
});
