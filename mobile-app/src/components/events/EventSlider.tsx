import { IonSpinner } from '@ionic/react';
import { FreeMode } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import EventCard from './EventCard';
import "./EventSlider.css";

interface ContainerProps {
    items: Array<DecentralandEvent>,
}
const EventSlider: React.FC<ContainerProps> = ({ items }) => {
    return (
        <div className="event-slider">
            {items.length === 0 &&
                <div className="loading">
                    <IonSpinner />
                </div>
            }
            <Swiper
                freeMode={true}
                slidesPerView="auto"
                modules={[FreeMode]}>
                {items.map((event, index) =>
                    <SwiperSlide key={index} className={items.length === 1 ? "single" : ""}>
                        <EventCard event={event}></EventCard>
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    )
}
export default EventSlider;
