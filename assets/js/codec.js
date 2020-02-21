var key;
var identity;
var bytes = new Array();
fillArrayBytes();
var encoded = new Array();

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-left",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "750",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

/**
 * Etape 1
 * @returns {boolean}
 */
function processStep1() {
    let uploader = document.getElementById('file_step_1').files[0];
    if(uploader != null) {
        let reader = new FileReader();
        reader.readAsText(uploader);
        reader.onload = function () {
            let data = reader.result;
            let regex = "\\[(.*?)\\]";
            data = data.match(regex);
            if(data === null) {
                toastr.error('Veuillez choisir une matrice G4C valide.', 'Erreur');
                return false;
            }

            data = data[1].split(' ').map(function(item) {
                return item.trim();
            });

            if(
                data.length    !== 4 ||
                data[0].length !== 8 ||
                data[1].length !== 8 ||
                data[2].length !== 8 ||
                data[3].length !== 8
            ) {
                toastr.error('Veuillez choisir une matrice G4C valide.', 'Erreur');
                return false;
            }

            data[0] = data[0].split('');
            data[1] = data[1].split('');
            data[2] = data[2].split('');
            data[3] = data[3].split('');

            key = data;
            identity = getMatrixIdentity();

            let next_step_1 = document.getElementById('next_step_1');
            next_step_1.style.display = "inline";

            fillEncodedBytes();
            toastr.success('Matrice G4C valide', 'Succès');

            return true;
        };
    } else {
        toastr.error('Veuillez selectionner un fichier', 'Erreur');
        return false;
    }
}

/**
 * Etape 2
 * @returns {boolean}
 */
function processStep2() {
    let uploader = document.getElementById('file_step_2').files[0];
    if(uploader != null) {
        let next_step_2 = document.getElementById('next_step_2');
        next_step_2.style.display = "inline";
        toastr.success('Fichier valide', 'Succès');
    } else {
        toastr.error('Fichier invalide', 'Erreur');
        return false;
    }
}

/**
 * Fonction d'encodage
 * @returns {boolean}
 */
function encode() {
    let uploader = document.getElementById('file_step_2').files[0];
    if(uploader != null) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(uploader);
        reader.onload = function () {
            let byteArray = new Uint8Array(reader.result);
            let content = [];
            let index = 0;

            for(let i = 0; i < byteArray.length; i++) {
                content[index] = parseInt(encoded[byteArray[i]].substr(0, 8), 2);
                index++;

                content[index] = parseInt(encoded[byteArray[i]].substr(8, 16), 2);
                index++;
            }

            toastr.success('Encodage terminé', 'Succès');
            download(uploader.name + "c", content);
        };

    } else {
        toastr.error('Veuillez choisir un fichier', 'Erreur');
        return false;
    }
}

function decode() {
    let uploader = document.getElementById('file_step_2').files[0];
    if(uploader != null) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(uploader);
        reader.onload = function () {
            let data = reader.result;
            let byteArray = new Uint8Array(data);
            let content = [];
            let index = 0;
            for(let i = 0; i < byteArray.length; i+=2) {
                content[index] = decodeByte(byteString(byteArray[i]), byteString(byteArray[i + 1]));
                index++;
            }

            toastr.success('Decodage terminé', 'Succès');
            download(uploader.name + "d", content);
        };
    } else {
        toastr.error('Veuillez choisir un fichier', 'Erreur');
        return;
    }
}

/**
 * Rerouve le binaire caché dans deux octets via la matrice identié
 * @param x1
 * @param x2
 * @returns {number}
 */
function decodeByte(x1, x2) {
    return parseInt(
        x1[identity[0]] +
        x1[identity[1]] +
        x1[identity[2]] +
        x1[identity[3]] +
        x2[identity[0]] +
        x2[identity[1]] +
        x2[identity[2]] +
        x2[identity[3]]
        , 2)
}

/**
 * Envoie le blob en téléchargement sur le navigateur
 * @param filename
 * @param data
 */
function download(filename, data) {
    let buffer = new Blob([new Uint8Array(data)], {type: "octet/stream"});

    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    let url = window.URL.createObjectURL(buffer);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}


/**
 * Extrait la matrice identité de la matrice G4C
 * @returns {[number, number, number, number]}
 */
function getMatrixIdentity() {
    let first, second, third, fouth;
    for(let i = 0; i < 8; i++) {
        if(key[0][i] == 1 && key[1][i] == 0 && key[2][i] == 0 && key[3][i] == 0) {
            first = i;
        }

        if(key[0][i] == 0 && key[1][i] == 1 && key[2][i] == 0 && key[3][i] == 0) {
            second = i;
        }

        if(key[0][i] == 0 && key[1][i] == 0 && key[2][i] == 1 && key[3][i] == 0) {
            third = i;
        }

        if(key[0][i] == 0 && key[1][i] == 0 && key[2][i] == 0 && key[3][i] == 1) {
            fouth = i;
        }
    }

    return [first, second, third, fouth];
}

/**
 * Convertion d'un int (0 <-> 255) en sa représentation binaire (sur 8 octets)
 * @param n
 * @returns {string}
 */
function byteString(n) {
    return ("000000000" + n.toString(2)).substr(-8);
}

/**
 * Convertion de tous les int de 0 à 255 en leur représentation binaire
 */
function fillArrayBytes() {
    for(let i = 0; i < 256; i++) {
        bytes[i] = byteString(i);
    }
}

/**
 * Multiplication de tous les bytes via la matrice G4C
 */
function fillEncodedBytes() {
    for(let i = 0; i < 256; i++) {
        encoded[i] = calculateMatrix([bytes[i][0], bytes[i][1], bytes[i][2], bytes[i][3]], key);
        encoded[i] += calculateMatrix([bytes[i][4], bytes[i][5], bytes[i][6], bytes[i][7]], key);
    }
}

/**
 * Multiplication de matrices via les fonctions de la librairie math.js
 * @param bits
 * @param matrix
 * @returns {string}
 */
function calculateMatrix(bits, matrix) {
    bits = math.matrix(bits);
    math.square(bits);

    matrix = math.matrix(matrix);
    math.square(matrix);

    bits = math.multiply(bits, matrix);
    bits = bits.toJSON()['data'].join('');

    return patchBinaries(bits);
}

/**
 * Remplacement des valeurs (2/3/4) par des (1)
 * @param bits
 * @returns {string}
 */
function patchBinaries(bits) {
    bits = bits.split('')
    for(let j = 0; j < bits.length; j++){
        if(bits[j] == 2) bits[j] = 1;
        if(bits[j] == 3) bits[j] = 1;
        if(bits[j] == 4) bits[j] = 1;
    }

    return bits.join('')
}