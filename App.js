import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  SafeAreaView, StatusBar, Platform, Modal, TextInput, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [plants, setPlants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // States for the "Add New" form
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState('');

  useEffect(() => { loadPlants(); }, []);
  useEffect(() => { savePlants(plants); }, [plants]);

  const loadPlants = async () => {
    try {
      const saved = await AsyncStorage.getItem('@plant_list');
      if (saved) setPlants(JSON.parse(saved));
      else setPlants([{ id: '1', name: 'Monstera', daysLeft: 3, frequency: 7 }]);
    } catch (e) { console.log(e); }
  };

  const savePlants = async (data) => {
    try { await AsyncStorage.setItem('@plant_list', JSON.stringify(data)); } 
    catch (e) { console.log(e); }
  };

  const addNewPlant = () => {
    if (!newName || !newFreq) {
      Alert.alert("Wait!", "Please fill in both fields.");
      return;
    }
    const newPlant = {
      id: Date.now().toString(), // Generates a unique ID
      name: newName,
      daysLeft: parseInt(newFreq),
      frequency: parseInt(newFreq)
    };
    setPlants([...plants, newPlant]);
    setNewName('');
    setNewFreq('');
    setModalVisible(false);
  };

  const waterPlant = (id) => {
    setPlants(plants.map(p => p.id === id ? { ...p, daysLeft: p.frequency } : p));
  };

  const deletePlant = (id) => {
    setPlants(plants.filter(p => p.id !== id));
  };

  const renderPlant = ({ item }) => (
    <View style={[styles.card, item.daysLeft === 0 ? styles.urgent : styles.normal]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.statusText}>
          {item.daysLeft === 0 ? "Needs Water Now! 💧" : `Next water in ${item.daysLeft} days`}
        </Text>
      </View>
      <View style={{flexDirection: 'row', gap: 10}}>
        <TouchableOpacity style={styles.waterButton} onPress={() => waterPlant(item.id)}>
          <Text style={styles.buttonText}>DONE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deletePlant(item.id)}>
          <Text style={{fontSize: 20}}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My Urban Jungle 🌿</Text>
        <Text style={styles.subtitle}>Keep them alive and thriving.</Text>
      </View>

      <FlatList
        data={plants}
        renderItem={renderPlant}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
      />

      {/* THE ADD PLANT MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Plant</Text>
            <TextInput 
              placeholder="Plant Name (e.g. Aloe Vera)" 
              style={styles.input} 
              value={newName} 
              onChangeText={setNewName}
            />
            <TextInput 
              placeholder="Watering Frequency (Days)" 
              style={styles.input} 
              keyboardType="numeric"
              value={newFreq} 
              onChangeText={setNewFreq}
            />
            <View style={{flexDirection: 'row', gap: 15, marginTop: 10}}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#ccc'}]} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#2D4F1E'}]} onPress={addNewPlant}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Add Plant</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 30, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D4F1E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 15, backgroundColor: '#fff', elevation: 3 },
  urgent: { borderLeftWidth: 8, borderLeftColor: '#E67E22' },
  normal: { borderLeftWidth: 8, borderLeftColor: '#2ECC71' },
  plantName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusText: { color: '#777', marginTop: 4 },
  waterButton: { backgroundColor: '#2D4F1E', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  fab: { position: 'absolute', right: 25, bottom: 25, backgroundColor: '#2D4F1E', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { fontSize: 35, color: 'white', marginTop: -3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#2D4F1E' },
  input: { width: '100%', borderBottomWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 20 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' }
});
