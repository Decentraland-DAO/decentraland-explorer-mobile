import { useEffect } from "react";
import { useHistory } from "react-router";
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { PushService } from "./services/PushService";

const AppUrlListener: React.FC<any> = () => {
  const history = useHistory();
  useEffect(() => {
    PushService.initialize(history);
    console.log("running")
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      const slug = event.url.split('dcland.app').pop();
      if (slug) {
        history.push(slug);
      }
    });
  }, [history]);

  return null;
};

export default AppUrlListener;
