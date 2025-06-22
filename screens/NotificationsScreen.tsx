import React, {useState} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from './navigationTypes';
// import { Image } from 'react-native-reanimated/lib/typescript/Animated';

type NotificationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NotificationsScreen'
>;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'message' | 'alert' | 'update' | 'payment';
}

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  // Sample notifications data
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New Message',
      message: '',
      time: '10 min ago',
      isRead: false,
      type: 'message',
    },
  ]);
  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(item =>
        item.id === id ? {...item, isRead: true} : item,
      ),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(item => item.id !== id));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ],
    );
  };

  const renderNotificationItem = ({item}: {item: NotificationItem}) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}>
        <Image
          style={styles.deleteicon}
          source={{
            uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAASFBMVEX////nVFDmSUXtiIXthYPuiojtg4HnUU3ujInmRUDtgoDmTkn+9vbui4jpX1v2xcT3zMvvkI7qbGn529rzsrHpZmP0trToW1eMJ/VyAAAFFklEQVR4nO2d3WKiMBCFhbYbIxYFxb7/m65uqq0wQiCT+WHnu+zFNIecITHJhM3GMAzDMAzDMAzDMAzDMAzDMAzDMAxjDsem7XaXPXczHuwvu65tjmjxTrWvnHOlP6OFTOPsy2t7Kl+fcOIdSlcE/BYnYiJb/90eVx4w4p0eAouifMeImMh7+WiPKzF6sf4ReJX4ByFiGr8EXiXW6QGPvvhN+ZYeMomP8qk9Pv1101SFJIk9gUXVJIdsXdGTyJmL7z2BhWuTY3Z9hZwSBwIL1yUH3Q0UFuUHQmOX0LfoTeEuOeplGJUrF9+gplySw+79MCyPUYcWveIRppJnIRKhHixwJpJbKDS5UYEcvLYCaRoJPj3i2Q1oUTwn8UvMLJDfqLBFUQctXomwwE/cf8Jp1OwWDfBJJBLIZ1SCHBz/V7mHftg7mR4sh1HJLBqg70XSHrxBnYufdDl4B36m6b/RYIgtGqCUyCKQ0qiwRZFnMhCwRPwnC7uFZAGFZtBgsmgAloj7zyn+xwj5c5FwqgYDvwTwnjBsUdKFk7y5yJqDd+BexHnK5FM1mHy5SPKLPoZcRhVh0UAeiYIE5jGqGIsG8AcNIS+ZqQYtN6ooiwZwe1FcD97AzEX2qRoMnlEFWjSAJVGsQCyjwhblPr3zDYZEYeNgn3SjCrZoIFWieIGpRhU6TDyTsgIncqAfstyoCiwaWLpto6QHbyzLRYbNl+Us2dNQY9HAfInKBM43Ktvmy3LmSWTcfFnOnEFDnUUD8VsqSgXGG1XFVA0mbu1GwObLcmJyUa1FA9PbNoqmajBTuSj8F30M40ZVbtHA2ARuFQLHjLoCiwZeLQ+KXjacB2jU6qsC/qrPogGwtyB09uANMBcBgSqmajCgUdfTgzciJGrNwTuTuai7B29M5KLGcbDPqFG1WzQwInEdAkeMqnmYeGYLzWOu85vVCNxsvkCFX9zNwuPtRR+qHyjuvBwT9Y+FAfAH77fEXNU2pIwIJK8Iz8LEtE2/USen3toljlp0DUaNEKh76ha5jKHXqFE9qLkXQYEv1tpU5uKrzRfuOzbQeH1OZiUSx/YmaMulMzG++bICiVPnZNQbdXqHl+eODTRi9gf5L2ZKIG6PnrmUOYXYczJqczH+nAz8KMQbdc4evcpcnLeFrXDDe+4hBHW5OP8YiTKjLjkno0risnMyioy69DBe7js20Fh+lEuJUVOOU6roxbQjzQpyMfW0oXijph+nFC4R49S9aKPCz3/uORnBErFO/Io1Kt6RZqG/+jErX0QaFbduQuAKHPape3G5iF/5QnXtZCQ5ipRF5WKewhBBexq5Kl/ESMxXpCzEqDnL60S8bvIWZwkYNHJPsNgncPmLlJlzkaJIGX6RERmVpkCSMReptlNy3nI7Cl0FKFMuUtbwshiVtkiZQSJ1kTK5UelvQiBe8Oeooyc1Ks9dFoS9yHWfDFku8l31QGRUzrssSCTyXnlEYFTuyzqyS+S/biWzUfkFZpYIW4S6hjfjt2Th7wHTr0KDEjG+B7z+bzqv/7vc6/+2ejdQyLhlOTSq65KDtn2FrHuyA4muTY7Z9KrpmK9b6Ru1apJDHp/fpeyXdfQk+mN6yPq3TfkPfzy/UV2NEPFUOkkCn3LRlSeMiIeHRI8ySUpm6x8CDzgRT7WvnHMlxhQJhbMvr+2pfI3Sg/84Nm23u6RPkLDYX3Zd2yC8ZAzDMAzDMAzDMAzDMAzDMAzDMAzD+K/4C/CgLTN84AlDAAAAAElFTkSuQmCC',
          }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            style={styles.backicon}
            source={{
              uri: 'data:image/png;base64,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',
            }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllNotifications}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.notificationList}
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>proposed by</Text>
        <Text style={styles.footerLogo}> WATABE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#0014A8',
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    justifyContent: 'space-between',
  },
  backicon: {
    height: 20,
    width: 20,
  },
  deleteicon: {
    height: 20,
    width: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  notificationList: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#e8f4fc',
    borderLeftWidth: 3,
    borderLeftColor: '#0014A8',
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLogo: {
    fontSize: 14,
    color: '#0014A8',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default NotificationsScreen;
