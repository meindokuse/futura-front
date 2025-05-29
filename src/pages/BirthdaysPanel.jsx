import React, { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import axios from 'axios';
import { API_URL,capitalize} from '../utils/utils';
import styles from './Home.module.css';
import Loader from '../components/Loader' 


export default function BirthdaysPanel() {
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [photoCache, setPhotoCache] = useState({});

  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}employers/get_list_birth`, {
        params: { page: 1, limit: 10 }
      });
      setBirthdays(response.data);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Ошибка загрузки дней рождений:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhoto = async (employerId) => {
    // Проверяем кеш
    if (photoCache[employerId]) {
      return photoCache[employerId];
    }

    try {
      const response = await axios.get(`${API_URL}employers/${employerId}/photo`, {
        responseType: 'blob'
      });
      const photoUrl = URL.createObjectURL(response.data);
      
      // Обновляем кеш
      setPhotoCache(prev => ({
        ...prev,
        [employerId]: photoUrl
      }));

      return photoUrl;
    } catch (err) {
      console.error('Ошибка загрузки фото:', err);
      return "../../public/default-employer.jpg"; // Запасное фото
    }
  };

  useEffect(() => {
    if (showBirthdays) {
      fetchBirthdays();
    }
  }, [showBirthdays]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' });
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button 
        className={styles.floatingButton}
        onClick={() => setShowBirthdays(!showBirthdays)}
        aria-label="Ближайшие дни рождения"
      >
        <Gift size={24} />
        {birthdays.length > 0 && (
          <span className={styles.badge}>{birthdays.length}</span>
        )}
      </button>

      {/* Боковая панель */}
      <div className={`${styles.birthdaysPanel} ${showBirthdays ? styles.open : ''}`}>
        <div className={styles.birthdaysHeader}>
          <h3>Ближайшие дни рождения</h3>
          <button 
            onClick={() => setShowBirthdays(false)}
            className={styles.closeButton}
          >
            &times;
          </button>
        </div>
        
        {loading ? (
          <Loader/>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.birthdaysList}>
            {birthdays.map(person => {
              const [lastName, firstName] = person.fio.split(' ');
              const date = formatDate(person.date_of_birth);
              
              return (
                <BirthdayCard 
                  key={person.id}
                  id={person.id}
                  firstName={firstName}
                  lastName={lastName}
                  position={person.work_type}
                  date={date}
                  fetchPhoto={fetchPhoto}
                  photoCache={photoCache}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Оверлей */}
      {showBirthdays && (
        <div 
          className={styles.overlay}
          onClick={() => setShowBirthdays(false)}
        />
      )}
    </>
  );
}

// Отдельный компонент для карточки с загрузкой фото
const BirthdayCard = ({ id, firstName, lastName, position, date, fetchPhoto, photoCache }) => {
  const [photo, setPhoto] = useState(photoCache[id] || '/default-avatar.jpg');

  useEffect(() => {
    if (!photoCache[id]) {
      fetchPhoto(id).then(setPhoto);
    }
  }, [id, fetchPhoto, photoCache]);

  return (
    <div className={styles.birthdayCard}>
      <div className={styles.avatarContainer}>
        <img 
          src={photo}
          alt={`${capitalize(firstName)} ${capitalize(lastName)}`}
          className={styles.avatar}
          onError={() => setPhoto('/default-avatar.jpg')}
        />
        <span className={styles.dateBadge}>{date}</span>
      </div>
      <div className={styles.personInfo}>
        <span className={styles.name}>{capitalize(firstName)}</span>
        <span className={styles.lastName}>{capitalize(lastName)}</span>
        <span className={styles.position}>{capitalize(position)}</span>
      </div>
    </div>
  );
};