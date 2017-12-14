import { firestore, auth, database, initializeApp } from 'firebase';
import { firebaseConfig } from '../config.js';
require("firebase/firestore");

initializeApp(firebaseConfig);

class Firebase {

    signWithFacebook() {
        const provider = new auth.FacebookAuthProvider();
        //provider.addScope('pages_messaging');
        //provider.addScope('user_birthday');
        auth().signInWithPopup(provider).then((result) => {
            var token = result.credential.accessToken;
            var user = result.user;
        }).catch((error) => {
            console.log(error)
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
        });
    }


    signinOrCreateUser(organisationId) {
        auth().setPersistence(auth.Auth.Persistence.LOCAL);
        return new Promise((resolve, reject) => {
            auth().onAuthStateChanged((account) => {
                if (account) {
                    resolve({ id: account.uid });
                } else {
                    auth().signInAnonymously();
                }
            });
        });
    }

    trackActivity(organisationId, clientId) {
        return firestore()
            .collection('organisations').doc(organisationId)
            .collection('users').doc(clientId)
            .collection('activities').add({ timestamp: Date.now(), url: window.location.href });
    }

    pageSeens(organisationId, clientId) {
        const lastHour = Date.now() - (1 * 1000 * 60 * 60);

        return firestore()
            .collection('organisations').doc(organisationId)
            .collection('users').doc(clientId)
            .collection('activities')
            .where("timestamp", ">", lastHour).get().then((snap) => {
                return snap.size;
            });
    }

    visits(organisationId, clientId) {
        return firestore()
            .collection('organisations').doc(organisationId)
            .collection('users').doc(clientId)
            .collection('activities').get().then((snap) => {
                return snap.size;
            });
    }

    getOrganisation(organisationId) {
        return firestore().collection('organisations').doc(organisationId).get().then((snap) => {
            return snap.data();
        });
    }


    getAgents(organisationId) {
        return new Promise((resolve, reject) => {
            const usersP = firestore().collection("users")
                .where("organisationId", "==", organisationId)
                .where("available", "==", true).get();

            const aiP = firestore()
                .collection("organisations").doc(organisationId)
                .collection("ais").get();

            Promise.all([aiP, usersP]).then(values => {
                const arr = [];
                for (var i = 0; i < values.length; i++) {
                    values[i].forEach((u) => {
                        let agent = u.data();
                        agent.id = u.id;
                        arr.push(agent);
                    })
                }
                resolve(arr); // [3, 1337, "foo"] 
            });

        });
    }

    getLocations(organisationId) {
        return firestore().collection('organisations').doc(organisationId).collection('locations').get()
            .then((locations) => {
                const arr = [];
                locations.forEach((l) => {
                    let location = l.data();
                    location.id = l.id;
                    arr.push(location);
                })
                return arr;
            });
    }

    //Still firebase
    sendMessage(organisationId, clientId, content, from) {
        var messagesRef = database().ref('queue/messages/tasks');
        const msgObj = {
            type: 'text',
            content,
            from,
            timestamp: new Date().getTime(),
            organisationId,
            clientId,
            source: 'website'
        }
        return messagesRef.push(msgObj).then(() => msgObj)
    }

    listenNewMessages(organisationId, clientId, cb) {
        firestore()
            .collection('organisations').doc(organisationId)
            .collection('conversations').doc(clientId)
            .collection('messages').onSnapshot((snapshot) => {
                const messages = [];
                snapshot.docChanges.forEach((change) => {
                    if (change.type === "added") {
                        messages.push(change.doc.data());
                    };
                })
                cb(messages);
            });
    }

    getTicket(organisationId, userId) {
        return new Promise((resolve, reject) => {
            firestore().collection('organisations').doc(organisationId).collection('requests')
                .where("clientId", "==", userId).get().then((r) => {
                    if (r.size === 0) {
                        resolve(null);
                    } else {
                        r.forEach((v) => {
                            resolve(v.data());
                            return;
                        })
                    }
                });
        });
    }



    listenPresence(organisationId, ticketId, clientId) {
        var statusRef = database().ref(`status/${ticketId}`);

        statusRef.set({ organisationId, ticketId, clientId, status: 'live' });
        statusRef.onDisconnect().set({ organisationId, ticketId, clientId, status: 'off' })
    }

    loadRules(organisationId, clientId) {
        return firestore().collection('organisations').doc(organisationId).collection('rules').get()
            .then((rules) => {
                const arr = [];
                rules.forEach((l) => {
                    let rule = l.data();
                    rule.id = l.id;
                    arr.push(rule);
                })
                return arr;
            });
    }

}

/*
function uploadImage(from, to) {
    return new Promise((resolve, reject) => {
        if (from) {
            const storageRef = firebase.storage().ref(to);
            const metadata = { contentType: 'image/jpeg' };
            storageRef.putString(from, 'data_url', metadata)
                .then((e) => {
                    resolve(e.downloadURL);
                })
        } else {
            resolve(null);
        }
    });
}*/

const obj = new Firebase();
export default obj;

