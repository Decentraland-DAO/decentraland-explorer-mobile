import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSpinner } from '@ionic/react';
import '../marketplace/LocationInfo.css';
import RetriedImg from '../RetriedImg';
import Linkify from 'react-linkify';
import { Browser } from '@capacitor/browser';
import { Announcement } from '../../api/announcement/Announcement';
import { useEffect, useState } from 'react';
import { AnnouncementService } from '../../services/AnnouncementService';
import { StorageService } from '../../services/StorageService';

interface ContainerProps {
  announcementId: string
}

const AnnouncementInfo: React.FC<ContainerProps> = ({ announcementId }) => {

  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    try {
      const announcementService = AnnouncementService.getInstance();
      const data = await announcementService.getAnnouncement(announcementId);
      setAnnouncement(data);
      let viewedAnnouncements = await StorageService.getInstance().get("viewed-announcements");
      if (!viewedAnnouncements) {
        viewedAnnouncements = [];
      }
      viewedAnnouncements.push(data?.id);
      await StorageService.getInstance().set("viewed-announcements", viewedAnnouncements);
    }
    finally {
      setLoading(false);
    }
  };

  const openExternalUrl = (url: string) => {
    Browser.open({ url: url });
  }

  return (
    <div className="location-info">
      <IonCard>
        {loading &&
          <IonCardContent className="loading">
            <IonSpinner />
          </IonCardContent>
        }
        {!loading && announcement &&
          <>
            {announcement.image &&
              <RetriedImg className="main-img" alt={announcement.title} src={announcement.image} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land_512x256.png"} retries={5}></RetriedImg>
            }
            <IonCardHeader>
              <IonCardTitle>{announcement.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a onClick={(e) => Browser.open({ url: decoratedHref })} key={key}>
                    {decoratedText}
                  </a>
                )}>
                  <div
                    dangerouslySetInnerHTML={{ __html: announcement.html }}
                  />
                </Linkify>
              </p>
              {announcement.actionText && announcement.actionUrl &&
                <IonButton expand="block" color="primary" onClick={() => openExternalUrl(announcement.actionUrl as string)}>{announcement.actionText}</IonButton>
              }
            </IonCardContent>
          </>
        }
      </IonCard>
    </div >
  );
};

export default AnnouncementInfo;
