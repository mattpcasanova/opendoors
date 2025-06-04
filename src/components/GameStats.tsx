import React from 'react';
import { Text, View } from 'react-native';

interface GameStatsData {
  gamesPlayed: number;
  stayWins: number;
  switchWins: number;
}

interface Props {
  stats: GameStatsData;
}

export default function GameStats({ stats }: Props) {
  return (
    <View style={{
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: '#E0E0E0'
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center'
      }}>
        Your Game Statistics
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#009688' 
          }}>
            {stats.gamesPlayed}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Games Played
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#009688' 
          }}>
            {stats.stayWins}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Stay Wins
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#009688' 
          }}>
            {stats.switchWins}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Switch Wins
          </Text>
        </View>
      </View>
    </View>
  );
}
