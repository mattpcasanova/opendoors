import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants';
import type { GrantedReward, GrantedRewardStatus } from '../../services/schoolService';

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const STATUS_CONFIG: Record<GrantedRewardStatus, StatusConfig> = {
  granted: { label: 'Available', color: Colors.primaryDark, bg: Colors.primaryMuted, icon: 'ribbon' },
  redeem_requested: { label: 'Waiting for teacher', color: Colors.warningDark, bg: 'rgba(245, 158, 11, 0.12)', icon: 'hourglass' },
  redeemed: { label: 'Redeemed', color: Colors.successDark, bg: 'rgba(16, 185, 129, 0.12)', icon: 'checkmark-circle' },
  denied: { label: 'Denied', color: Colors.gray500, bg: Colors.gray100, icon: 'close-circle' },
  revoked: { label: 'Revoked', color: Colors.gray500, bg: Colors.gray100, icon: 'remove-circle' },
  lost: { label: 'Not won', color: Colors.gray500, bg: Colors.gray100, icon: 'close-circle' },
};

interface Props {
  reward: GrantedReward;
  /** Show a student name line (teacher-facing lists). */
  studentName?: string;
  /** Student-facing "Use" action for direct rewards; shown only when status is 'granted'. */
  onUse?: () => void;
  /** Student-facing "Play" action for game rewards; shown only when status is 'granted'. */
  onPlay?: () => void;
  /** Disable the action while a request is in flight. */
  busy?: boolean;
}

const GrantedRewardCard: React.FC<Props> = ({ reward, studentName, onUse, onPlay, busy }) => {
  const status = STATUS_CONFIG[reward.status];
  const isTerminal = reward.status === 'denied' || reward.status === 'revoked' || reward.status === 'lost';
  const isGame = reward.reward_type === 'game';

  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: status.color,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        opacity: isTerminal ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: status.bg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={status.icon} size={26} color={status.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Colors.gray900,
              textDecorationLine: isTerminal ? 'line-through' : 'none',
            }}
          >
            {reward.title}
          </Text>
          {reward.description ? (
            <Text style={{ fontSize: 13, color: Colors.gray600, marginTop: 2 }}>
              {reward.description}
            </Text>
          ) : null}
          {reward.note ? (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, backgroundColor: Colors.primaryMuted, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8 }}>
              <Ionicons name="chatbubble-ellipses" size={14} color={Colors.primary} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 13, color: Colors.primaryDark, fontStyle: 'italic' }}>
                {reward.note}
              </Text>
            </View>
          ) : null}
          {isGame && !isTerminal && reward.status !== 'redeemed' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Ionicons name="game-controller" size={13} color={Colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>
                Play to win · 1 in {reward.doors}
              </Text>
            </View>
          ) : null}
          {studentName ? (
            <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 4 }}>
              For: {studentName}
            </Text>
          ) : null}

          {/* Status pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: status.bg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              marginTop: 8,
              gap: 4,
            }}
          >
            <Ionicons name={status.icon} size={13} color={status.color} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: status.color }}>
              {status.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Student action */}
      {reward.status === 'granted' && isGame && onPlay ? (
        <TouchableOpacity
          onPress={onPlay}
          disabled={busy}
          activeOpacity={0.85}
          style={{
            marginTop: 14,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: busy ? 0.6 : 1,
          }}
        >
          <Ionicons name="game-controller" size={18} color={Colors.white} />
          <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>
            Play for this reward
          </Text>
        </TouchableOpacity>
      ) : reward.status === 'granted' && onUse ? (
        <TouchableOpacity
          onPress={onUse}
          disabled={busy}
          activeOpacity={0.85}
          style={{
            marginTop: 14,
            backgroundColor: Colors.primary,
            borderRadius: 12,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="hand-left" size={18} color={Colors.white} />
          )}
          <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>
            Use this reward
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default GrantedRewardCard;
