import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const QuizScreen = () => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    // Placeholder for quiz answer submission logic
    alert(`Submitted answer: ${answer}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.question}>What is 2 + 2?</Text>
      <TextInput
        style={styles.input}
        placeholder="Your answer"
        value={answer}
        onChangeText={setAnswer}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  question: {
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});

export default QuizScreen; 