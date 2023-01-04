import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Buffer } from 'buffer';
import { AppReviewService } from './services/AppReviewService';
import { Device } from '@capacitor/device';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { StorageService } from './services/StorageService';

global.Buffer = Buffer;

const initServices = () => {
  // init app review service
  AppReviewService.getInstance();

  // init storage service
  StorageService.getInstance();

  // init firebase for web
  Device.getInfo().then(d => {
    if (d.platform === "web") {
      FirebaseAnalytics.initializeFirebase({
        apiKey: "AIzaSyAQ_6V3BudLxpEtLB2QMzezBp6cXTTnG0I",
        authDomain: "decentraland-app.firebaseapp.com",
        projectId: "decentraland-app",
        storageBucket: "decentraland-app.appspot.com",
        messagingSenderId: "751340632845",
        appId: "1:751340632845:web:be002fd217cd4ac9670e44",
        measurementId: "G-HHQBL9G9Y0"
      });
    }
  });
}

initServices();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
