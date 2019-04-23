// Exécute un appel AJAX GET
// Prend en paramètres l'URL cible et la fonction callback appellé en cas de succès
function ajaxGet(url, callback) {

	var req = new XMLHttpRequest();

	req.open("GET", url);

	req.addEventListener("load", function () {
		if (req.status >= 200 && req.status < 400) {
			callback(req.responseText);
		} else {
			console.error(req.status + " " + req.statusText + " " + url);
		}
	});

	req.addEventListener("error", function () {
		console.error("Erreur réseau avec l'url " + url);
	}); 
    req.overrideMimeType("application/json"); //
    
	req.send(null);
}