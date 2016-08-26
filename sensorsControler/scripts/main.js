var monImage = document.querySelector('img');

monImage.onclick = function() {
	var maSrc = monImage.getAttribute('src');
    if(maSrc === 'images/firefox-icon.png') {
      	monImage.setAttribute ('src','images/firefox2.png');
    } 
    else {
      	monImage.setAttribute ('src','images/firefox-icon.png');
    }
}

var monBouton = document.querySelector('button');
var monTitre = document.querySelector('h1');

function définirNomUtilisateur() {
  var monNom = prompt('Veuillez saisir votre nom.');
  localStorage.setItem('nom', monNom);
  monTitre.textContent = 'Mozilla est cool, ' + monNom;
}

if(!localStorage.getItem('nom')) {
  définirNomUtilisateur();
} else {
  var nomEnregistré = localStorage.getItem('nom');
  monTitre.textContent = 'Mozilla est cool, ' + nomEnregistré;
}

monBouton.onclick = function() {
  définirNomUtilisateur();
}