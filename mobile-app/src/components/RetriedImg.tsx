import { useRef } from 'react';

interface ContainerProps {
  alt?: string,
  src: string,
  defaultSrc: string,
  retries: number,
  className?: string
}

const RetriedImg: React.FC<ContainerProps> = ({ alt, src, defaultSrc, retries, className }) => {
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
    <img className={className} ref={imgEl} style={{ visibility: "hidden" }} alt={alt} src={src} onError={handleImgOnError} onLoad={handleImgOnLoad}></img>
  );
};

export default RetriedImg;
