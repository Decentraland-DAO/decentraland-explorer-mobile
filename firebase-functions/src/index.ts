import * as admin from "firebase-admin";
import * as serviceAccount from "./serviceKeys/firebase.json";

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        privateKey: serviceAccount.private_key,
        clientEmail: "firebase-adminsdk-jpytj@decentraland-app.iam.gserviceaccount.com"
    }),
    databaseURL: "https://decentraland-app.firebaseio.com",
});
