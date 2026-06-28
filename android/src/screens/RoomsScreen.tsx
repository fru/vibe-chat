import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

/**
 * Rooms screen — native translation of
 * `frontend/src/app/pages/page-rooms.ts`.
 */
export function RoomsScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <IconButton icon="door" size={24} />
          <Text variant="bodyLarge">Zimmer 1</Text>
          <IconButton icon="pencil" accessibilityLabel="Edit room" />
          <IconButton icon="delete" accessibilityLabel="Delete room" />
          <View style={styles.spacer} />
          <IconButton icon="chevron-right" />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 12,
  },
  card: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
});
