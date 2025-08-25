import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Linkedin, Instagram, 
  Calendar, Users, Clock, Gift 
} from 'lucide-react';
import useInView from '../hooks/useInView';
import ModalLastEvent from '../components/modals/ModalLastEvent';
import ModalLocation from '../components/modals/ModalLocation';
import axios from 'axios';
import {API_URL, capitalize} from '../utils/utils';
import styles from './Home.module.css';
import BirthdaysPanel from './BirthdaysPanel';

export default function HomePage() {
  const [isLogoAnimated, setIsLogoAnimated] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBirthdays, setShowBirthdays] = useState(false);


  const fetchLatestEvent = async () => {
    try {
      const response = await axios.get(`${API_URL}events/get_latest`);
      setLastEvent(response.data);
      setLoadingEvent(false);
    } catch (err) {
      console.error('Ошибка загрузки событий:', err);
    } 
  };

  useEffect(() => {
    const loadEvent = async () => {
      try {
        await fetchLatestEvent();
      } catch (error) {
        console.error('Failed to fetch latest event:', error);
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();

    const timer = setTimeout(() => {
      setIsLogoAnimated(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const restaurants = [
    {
      id: 1,
      name: "Проспект Мира",
      image: "pm.jpg",
      images: [
        "lists/rest1/foto1.jpg",
        "lists/rest1/foto2.jpg",
        "lists/rest1/foto3.jpg",
      ],
      description: "Experience luxury dining with our Michelin star chef's exceptional cuisine.",
      address: "25 Luxury Avenue, Moscow",
      phone: "+7 (495) 123-4567",
      hours: "12:00 - 23:00"
    },
    {
      id: 2,
      name: "Никольская",
      image: "n.jpg",
      images: [
        "lists/rest2/foto1.jpg",
        "lists/rest2/foto2.jpg",
        "lists/rest2/foto3.jpg",
      ],
      description: "Modern European cuisine with a Russian twist in a stylish urban setting.",
      address: "42 City Center, Moscow",
      phone: "+7 (495) 987-6543",
      hours: "10:00 - 22:00"
    },
    {
      id: 3,
      name: "Страстной",
      image: "../../public/st.jpg",
      images: [
        "lists/rest3/foto1.jpg",
        "lists/rest3/foto2.jpg",
        "lists/rest3/foto3.jpg",
      ],
      description: "A perfect blend of Asian and European flavors in an elegant atmosphere.",
      address: "7 Cultural District, Moscow",
      phone: "+7 (495) 456-7890",
      hours: "16:00 - 02:00"
    }
  ];

  const keyContacts = [
    {
      id: 1,
      name: "Alexandra Ivanova",
      position: "Chief Executive Officer",
      email: "a.ivanova@hpfutura.ru",
      phone: "+7 (495) 123-4567",
      photo: "peoples/p1.jpg",
    },
    {
      id: 2,
      name: "Alexandra Ivanova",
      position: "Chief Executive Officer",
      email: "a.ivanova@hpfutura.ru",
      phone: "+7 (495) 123-4567",
      photo: "peoples/p2.jpg",
    },
    {
      id: 3,
      name: "Alexandra Ivanova",
      position: "Chief Executive Officer",
      email: "a.ivanova@hpfutura.ru",
      phone: "+7 (495) 123-4567",
      photo: "peoples/p3.jpg",
    }
  ];
  

  const handleOpenLocation = (location) => {
    setSelectedLocation(location);
    setCurrentImageIndex(0);
    setOpenLocationModal(true);
  };

  const [headerRef, headerInView] = useInView({ threshold: 0.1 });
  const [restaurantsRef, restaurantsInView] = useInView({ threshold: 0.1 });
  const [restaurantsTitleRef, restaurantsTitleInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [eventRef, eventInView] = useInView({ threshold: 0.1 });
  const [eventTitleRef, eventTitleInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [contactsRef, contactsInView] = useInView({ threshold: 0.1 });
  const [contactsTitleRef, contactsTitleInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [addressRef, addressInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <div className={styles.homepage}>
      {/* <button 
        className={styles.floatingButton}
        onClick={() => setShowBirthdays(!showBirthdays)}
        aria-label="Ближайшие дни рождения"
      >
        <Gift size={24} />
        <span className={styles.badge}>{upcomingBirthdays.length}</span>
      </button> */}


      {/* Шапка */}
      <div ref={headerRef} className={`${styles.header} ${headerInView ? styles.visible : ''}`}>
        <header>
          <h1 className={styles.title}>HP Futura Employers</h1>
          <div className={`${styles.logo} ${isLogoAnimated ? styles.animated : ''}`}>
            <img src="/logo.svg" alt="HP Futura Logo" />
          </div>
        </header>
      </div>

      {/* Секция ресторанов */}
      <div ref={restaurantsRef} className={`${styles.restaurantsSection} ${restaurantsInView ? styles.visible : ''}`}>
        <section className={styles.section}>
          <h2 ref={restaurantsTitleRef} className={`${styles.sectionTitle} ${restaurantsTitleInView ? styles.visible : ''}`}>
            Наши проекты
          </h2>
          
          <div className={styles.restaurantsGrid}>
            {restaurants.map((restaurant, index) => {
              const [cardRef, cardInView] = useInView({ threshold: 0.1, triggerOnce: true });
              return (
                <div 
                  key={restaurant.id}
                  ref={cardRef}
                  className={`${styles.restaurantCard} ${cardInView ? styles.visible : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  onClick={() => handleOpenLocation(restaurant)}
                >
                  <div className={styles.restaurantImage}>
                    <img src={restaurant.image} alt={restaurant.name} />
                  </div>
                  <div className={styles.restaurantInfo}>
                    <h3>{restaurant.name}</h3>
                    <p className={styles.description}>{restaurant.description}</p>
                    <div className={styles.details}>
                      <div className={styles.detail}>
                        <MapPin size={16} className={styles.icon} />
                        <span>{restaurant.address}</span>
                      </div>
                      <div className={styles.detail}>
                        <Phone size={16} className={styles.icon} />
                        <span>{restaurant.phone}</span>
                      </div>
                      <div className={styles.detail}>
                        <Clock size={16} className={styles.icon} />
                        <span>{restaurant.hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Секция последнего события */}
      <div ref={eventRef} className={`${styles.eventSection} ${eventInView ? styles.visible : ''}`}>
        <section className={styles.section}>
          <h2 ref={eventTitleRef} className={`${styles.sectionTitle} ${eventTitleInView ? styles.visible : ''}`}>
            Последнее событие
          </h2>
          
          {loadingEvent ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
            </div>
          ) : lastEvent ? (
            <div 
              className={styles.eventCardHorizontal}
              onClick={() => setOpenEventModal(true)}
            >
              <div className={styles.eventContent}>
                <div className={styles.eventMainInfo}>
                  <h3>{lastEvent.name}</h3>
                </div>
                
                <div className={styles.eventDetails}>
                  <div className={styles.eventDetail}>
                    <Calendar size={18} className={styles.icon} />
                    <span>
                      {new Date(lastEvent.date_start).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {lastEvent.location_name && (
                    <div className={styles.eventDetail}>
                      <MapPin size={18} className={styles.icon} />
                      <span>{capitalize(lastEvent.location_name)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                className={styles.learnMoreBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenEventModal(true);
                }}
              >
                Подробнее
              </button>
            </div>
          ) : (
            <p className={styles.noEvents}>Нет данных о последнем событии</p>
          )}
        </section>
      </div>

      {/* Секция контактов */}
      <div ref={contactsRef} className={`${styles.contactsSection} ${contactsInView ? styles.visible : ''}`}>
        <section className={styles.section}>
          <h2 ref={contactsTitleRef} className={`${styles.sectionTitle} ${contactsTitleInView ? styles.visible : ''}`}>
            Основные контакты
          </h2>
          
          <div className={styles.contactsGrid}>
            {keyContacts.map((contact, index) => {
              const [cardRef, cardInView] = useInView({ threshold: 0.1, triggerOnce: true });
              return (
                <div 
                  key={contact.id}
                  ref={cardRef}
                  className={`${styles.contactCard} ${cardInView ? styles.visible : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className={styles.contactImage}>
                    <img src={contact.photo} alt={contact.name} />
                  </div>
                  
                  <div className={styles.contactInfo}>
                    <h3>{contact.name}</h3>
                    <p className={styles.position}>{contact.position}</p>
                    
                    <div className={styles.contactDetails}>
                      <div className={styles.detail}>
                        <Mail size={16} className={styles.icon} />
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </div>
                      
                      <div className={styles.detail}>
                        <Phone size={16} className={styles.icon} />
                        <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* <div ref={addressRef} className={`${styles.addressCard} ${addressInView ? styles.visible : ''}`}>
            <div className={styles.addressContent}>
              <div className={styles.mainOffice}>
                <h3>Main Office</h3>
                
                <div className={styles.detail}>
                  <MapPin size={18} className={styles.icon} />
                  <span>
                    25 Tverskaya Street<br />
                    Moscow, 125009<br />
                    Russia
                  </span>
                </div>
                
                <div className={styles.detail}>
                  <Phone size={18} className={styles.icon} />
                  <a href="tel:+74951234567">+7 (495) 123-4567</a>
                </div>
                
                <div className={styles.detail}>
                  <Mail size={18} className={styles.icon} />
                  <a href="mailto:info@hpfutura.ru">info@hpfutura.ru</a>
                </div>
              </div>
              
              <div className={styles.social}>
                <h3>Follow Us</h3>
                
                <div className={styles.socialLinks}>
                  <a href="https://linkedin.com" className={styles.socialLink}>
                    <Linkedin size={20} />
                  </a>
                  
                  <a href="https://instagram.com" className={styles.socialLink}>
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div> */}
        </section>
      </div>

      {/* Модальные окна */}
      <ModalLastEvent
        open={openEventModal}
        onClose={() => setOpenEventModal(false)}
        event={lastEvent}
      />
      
      <ModalLocation
        open={openLocationModal}
        onClose={() => setOpenLocationModal(false)}
        location={selectedLocation}
        currentImageIndex={currentImageIndex}
      />
      <BirthdaysPanel />

    </div>
  );
}