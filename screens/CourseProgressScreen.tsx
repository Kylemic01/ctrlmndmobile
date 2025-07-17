import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const TOTAL_COURSES = 30;

// Extracted from courseplan.md
const courseData = [
  {
    title: 'Introduction to Mental Toughness',
    description: 'Begin building resilience to bounce back from setbacks.'
  },
  {
    title: 'Focus and Concentration',
    description: 'Learn to focus during high-pressure moments.'
  },
  {
    title: 'Positive Self-Talk and Confidence Building',
    description: 'Build confidence and eliminate self-doubt.'
  },
  {
    title: 'Relaxation and Stress Management',
    description: 'Learn to manage stress and stay relaxed under pressure.'
  },
  {
    title: 'Visualization for Success',
    description: 'Use visualization to mentally rehearse successful outcomes.'
  },
  {
    title: 'Performing Under Pressure',
    description: 'Practice performing at your best under high pressure.'
  },
  {
    title: 'Goal Setting for Long-Term Success',
    description: 'Set clear, achievable goals that guide your performance.'
  },
  {
    title: 'Focus and Control During Performance',
    description: 'Develop the ability to stay focused during your performance, avoiding distractions.'
  },
  {
    title: 'Mental Reset After Mistakes',
    description: 'Learn to mentally reset after mistakes.'
  },
  {
    title: 'Managing Performance Anxiety',
    description: 'Reduce performance anxiety before competition.'
  },
  {
    title: 'Self-Awareness and Reflection',
    description: 'Develop self-awareness to understand your strengths and areas for improvement.'
  },
  {
    title: 'Entering the Flow State',
    description: 'Learn to enter the flow state where performance is effortless.'
  },
  {
    title: 'Confidence in the Face of Adversity',
    description: 'Build confidence to stay composed in challenging situations.'
  },
  {
    title: 'Goal Tracking and Adjusting',
    description: 'Track progress towards your goals and adjust when needed.'
  },
  {
    title: 'Self-Compassion and Growth Mindset',
    description: 'Develop a growth mindset by practicing self-compassion.'
  },
  {
    title: 'Building Consistency and Habits',
    description: 'Build consistent mental habits that support your performance.'
  },
  {
    title: 'Relaxation for Mental Recovery',
    description: 'Learn to mentally recover after intense effort.'
  },
  {
    title: 'Using Pressure as a Performance Booster',
    description: 'Use pressure to fuel your performance, rather than hinder it.'
  },
  {
    title: 'Building Mental Resilience in Training',
    description: 'Develop mental resilience through consistent practice and perseverance.'
  },
  {
    title: 'Flow State for Consistent Peak Performance',
    description: 'Learn how to consistently access the flow state during training and competition.'
  },
  {
    title: 'Mastering the Transition from Focus to Relaxation',
    description: 'Switch seamlessly between focus and relaxation for balanced performance.'
  },
  {
    title: 'Handling Criticism and Feedback',
    description: 'Reframe criticism as an opportunity for growth.'
  },
  {
    title: 'Confidence Through Preparation',
    description: 'Build confidence by preparing thoroughly.'
  },
  {
    title: 'Mental Flexibility in Adapting to Changing Conditions',
    description: 'Practice mental flexibility when conditions change.'
  },
  {
    title: 'Mental Reset After a Tough Competition',
    description: 'Reset mentally after a high-stakes competition.'
  },
  {
    title: 'Building Patience and Persistence',
    description: 'Develop patience for long-term success.'
  },
  {
    title: 'Strengthening Emotional Control',
    description: 'Strengthen your ability to control emotions during competition.'
  },
  {
    title: 'Cultivating Consistency Through Routines',
    description: 'Develop consistent mental routines to perform at your best.'
  },
  {
    title: 'Maximizing Motivation Through Visualization',
    description: 'Reignite your motivation by visualizing your goals and progress.'
  },
  {
    title: 'Reflection and Growth',
    description: 'Reflect on the journey and embrace continuous growth.'
  },
];

const courses = courseData.map((c, i) => ({
  id: i + 1,
  title: c.title,
  description: c.description,
  status: i === 0 ? 'unlocked' : 'locked',
}));

const RADIUS = 40; // Smaller progress ring
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ percent }: { percent: number }) {
  const progress = Math.max(0, Math.min(percent, 100));
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);
  return (
    <Svg width={RADIUS * 2 + STROKE} height={RADIUS * 2 + STROKE}>
      <Circle
        cx={RADIUS + STROKE / 2}
        cy={RADIUS + STROKE / 2}
        r={RADIUS}
        stroke="#eee"
        strokeWidth={STROKE}
        fill="none"
      />
      <Circle
        cx={RADIUS + STROKE / 2}
        cy={RADIUS + STROKE / 2}
        r={RADIUS}
        stroke="#2e7d32"
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${RADIUS + STROKE / 2}, ${RADIUS + STROKE / 2}`}
      />
    </Svg>
  );
}

const CourseProgressScreen: React.FC = () => {
  const completedCourses = courses.filter(c => c.status === 'completed').length;
  const progressPercent = (completedCourses / courses.length) * 100;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Progress Overview Section */}
      <View style={styles.progressOverview}>
        <View style={styles.progressRingWrapper}>
          <ProgressRing percent={progressPercent} />
        </View>
        <Text style={styles.progressTextCenter}>{`${progressPercent.toFixed(0)}%`}</Text>
        <Text style={styles.lessonsRemaining}>{`Lessons Remaining: ${courses.length - completedCourses} of ${courses.length}`}</Text>
      </View>
      {/* Course Flow List */}
      <View style={styles.courseList}>
        {courses.map((course, idx) => {
          const isClickable = course.status === 'completed' || course.status === 'unlocked';
          const Wrapper = isClickable ? TouchableOpacity : View;
          let iconProps;
          if (course.status === 'completed') {
            iconProps = { name: 'check', color: '#2e7d32', backgroundColor: '#e6fbe6' };
          } else if (course.status === 'unlocked') {
            iconProps = { name: 'play-circle', color: '#FF9800', backgroundColor: '#fff6e6' };
          } else {
            iconProps = { name: 'lock', color: '#FF9800', backgroundColor: '#fff6e6' };
          }
          return (
            <Wrapper
              key={course.id}
              style={[
                styles.courseBlock,
                course.status === 'completed' && styles.completedBlock,
                course.status === 'locked' && styles.lockedBlock,
                isClickable && styles.clickableBlock,
              ]}
              onPress={
                isClickable
                  ? () => {
                      if (course.id === 1) {
                        alert('Coming soon');
                      } else {
                        alert(`Open course: ${course.title}`);
                      }
                    }
                  : undefined
              }
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: iconProps.backgroundColor }]}> 
                <MaterialIcons name={iconProps.name} size={32} color={iconProps.color} />
              </View>
              <View style={styles.courseTextContainer}>
                <Text
                  style={[
                    styles.courseTitle,
                    course.status === 'locked' && styles.lockedTitle,
                    course.status === 'completed' && styles.completedTitle,
                  ]}
                >
                  {course.title}
                </Text>
                <Text
                  style={[
                    styles.courseDescription,
                    course.status === 'locked' && styles.lockedDescription,
                  ]}
                >
                  {course.description}
                </Text>
              </View>
            </Wrapper>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0d0d0d', // Set background to dark
    padding: 20,
  },
  progressOverview: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressRingWrapper: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32, // keep margin below
    marginTop: 48, // add much more top margin
  },
  progressRingCenter: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressTextCenter: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#fff',
    marginBottom: 8,
  },
  lessonsRemaining: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
    marginBottom: 2,
  },
  courseList: {
    alignItems: 'flex-start',
    width: '100%',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  courseBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    width: '100%',
    opacity: 1,
  },
  completedBlock: {
    backgroundColor: '#e6fbe6',
  },
  lockedBlock: {
    backgroundColor: '#fff6e6',
    opacity: 0.6,
  },
  clickableBlock: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  courseIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    color: '#222',
  },
  completedTitle: {
    color: '#2e7d32',
  },
  lockedTitle: {
    color: '#aaa',
    fontWeight: '600',
  },
  courseDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  lockedDescription: {
    color: '#bbb',
  },
  placeholder: {
    color: '#bbb',
    fontStyle: 'italic',
  },
});

export default CourseProgressScreen; 