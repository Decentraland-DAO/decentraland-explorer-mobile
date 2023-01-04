import { IonImg } from '@ionic/react';
import { useRef } from 'react';

interface ContainerProps {
  alt?: string,
  src: string,
  defaultSrc: string,
  retries: number
}

const RetriedIonImg: React.FC<ContainerProps> = ({ alt, src, defaultSrc, retries }) => {
  const numOfRetries = useRef(0);
  const imgEl = useRef(null);

  const handleImgOnError = (e: any) => {
    if (numOfRetries.current < retries) {
      numOfRetries.current++;
      e.target.src = defaultSrc;
      setTimeout(() => {
        e.target.src = src;
      }, 500);
    }
    else {
      const img = imgEl.current as any;
      e.target.src = defaultSrc;
      setTimeout(() => {
        img.style.visibility = "";
      }, 500);
    }
  }

  const handleImgOnLoad = (e: any) => {
    const img = imgEl.current as any;
    if (img.src === src) {
      img.style.visibility = "";
    }
  }

  return (
    <div>
      <IonImg ref={imgEl} style={{ visibility: "hidden" }} src={src} onIonError={handleImgOnError} onIonImgDidLoad={handleImgOnLoad}></IonImg>
    </div>
  );
};

export default RetriedIonImg;
