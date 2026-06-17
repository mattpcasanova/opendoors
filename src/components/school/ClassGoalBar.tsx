import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Colors } from '../../constants';
import { ClassGoal } from '../../services/schoolService';

const ClassGoalBar: React.FC<{ goal: ClassGoal }> = ({ goal }) => {
  const target = Math.max(1, goal.target_doors);
  const pct = Math.min(100, Math.round((goal.progress / target) * 100));
  const reached = goal.progress >= target;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Ionicons name={reached ? 'trophy' : 'flag'} size={14} color={reached ? Colors.successDark : Colors.primary} />
        <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: Colors.gray800 }} numberOfLines={1}>
          {goal.title}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.gray500 }}>
          {goal.progress}/{goal.target_doors}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: Colors.gray200, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: reached ? Colors.success : Colors.primary }} />
      </View>
      {reached ? (
        <Text style={{ fontSize: 12, color: Colors.successDark, fontWeight: '600', marginTop: 4 }}>
          Goal reached! 🎉
        </Text>
      ) : null}
    </View>
  );
};

export default ClassGoalBar;
