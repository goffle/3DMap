var url = "https://geoip-db.com/json/"

function getRoughLocation() {
    return fetch(url).then(response => {
        if(!response.ok){
            throw new Error('Network response was not ok.');
        }
        return response.json();
    });
}

function getExactLocation() {
    return new Promise((resolve, reject) => {
        navigator.permissions.query({ 'name': 'geolocation' })
            .then((permission) => {
                if (permission.state === 'granted') {
                    if ((!window.chrome || window.isSecureContext) && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                            resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                        }, (error) => {
                            resolve(null)
                        });
                    } else {
                        resolve(null)
                    }
                }else{
                    resolve(null);
                }
            }).catch(() => {
                resolve(null)
            })
    });
}




const Location = {
    getExactLocation,
    getRoughLocation
}

export default Location;