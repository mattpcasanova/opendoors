import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants';
import {
  AssessmentName,
  DoorsVsAssessmentRow,
  RewardPreferenceStats,
  RosterMember,
  schoolService,
} from '../../services/schoolService';
import { LoadingSpinner } from '../ui';
import RecordScoresModal from './RecordScoresModal';

interface Props {
  visible: boolean;
  classId: string;
  className: string;
  roster: RosterMember[];
  onClose: () => void;
}

const rowName = (r: DoorsVsAssessmentRow) =>
  `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email;

// ---- stats helpers ----------------------------------------------------------
interface Fit {
  r: number;
  r2: number;
  slope: number;
  intercept: number;
  n: number;
}

const regression = (pts: Array<readonly [number, number]>): Fit | null => {
  const n = pts.length;
  if (n < 3) return null;
  const mx = pts.reduce((a, [x]) => a + x, 0) / n;
  const my = pts.reduce((a, [, y]) => a + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  const r = sxy / Math.sqrt(sxx * syy);
  const slope = sxy / sxx;
  return { r, r2: r * r, slope, intercept: my - slope * mx, n };
};

const strength = (r: number): string => {
  const a = Math.abs(r);
  const dir = r >= 0 ? 'positive' : 'negative';
  if (a < 0.1) return 'no meaningful';
  if (a < 0.3) return `a weak ${dir}`;
  if (a < 0.5) return `a moderate ${dir}`;
  if (a < 0.7) return `a strong ${dir}`;
  return `a very strong ${dir}`;
};

const niceMax = (v: number, step: number) => Math.max(step, Math.ceil(v / step) * step);

// ---- scatter plot -----------------------------------------------------------
const ScatterPlot: React.FC<{ rows: DoorsVsAssessmentRow[]; fit: Fit | null; width: number }> = ({
  rows,
  fit,
  width,
}) => {
  const pts = rows
    .filter((r) => r.score !== null && r.score !== undefined)
    .map((r) => [r.doors_earned, Number(r.score)] as const);

  const height = 240;
  const padLeft = 34;
  const padBottom = 28;
  const padTop = 14;
  const padRight = 14;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxDoors = pts.reduce((m, [x]) => Math.max(m, x), 0);
  const xMax = niceMax(maxDoors, 5);
  const minScore = pts.reduce((m, [, y]) => Math.min(m, y), 100);
  const yMin = Math.max(0, Math.floor((minScore - 8) / 10) * 10);
  const yMax = 100;

  const sx = (x: number) => padLeft + (x / xMax) * plotW;
  const sy = (y: number) => padTop + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const yTicks = [0, 1, 2, 3, 4].map((i) => Math.round(yMin + (i * (yMax - yMin)) / 4));
  const xTicks = [0, 1, 2, 3, 4].map((i) => Math.round((i * xMax) / 4));

  return (
    <Svg width={width} height={height}>
      {/* horizontal gridlines + y labels */}
      {yTicks.map((t) => (
        <G key={`y${t}`}>
          <Line x1={padLeft} y1={sy(t)} x2={padLeft + plotW} y2={sy(t)} stroke={Colors.gray200} strokeWidth={1} />
          <SvgText x={padLeft - 6} y={sy(t) + 3} fontSize={9} fill={Colors.gray400} textAnchor="end">
            {t}
          </SvgText>
        </G>
      ))}
      {/* x labels */}
      {xTicks.map((t) => (
        <SvgText key={`x${t}`} x={sx(t)} y={height - 10} fontSize={9} fill={Colors.gray400} textAnchor="middle">
          {t}
        </SvgText>
      ))}
      {/* axis titles */}
      <SvgText x={padLeft + plotW / 2} y={height - 0.5} fontSize={9.5} fill={Colors.gray500} textAnchor="middle">
        Doors earned
      </SvgText>

      {/* regression line */}
      {fit && (
        <Line
          x1={sx(0)}
          y1={sy(Math.min(yMax, Math.max(yMin, fit.intercept)))}
          x2={sx(xMax)}
          y2={sy(Math.min(yMax, Math.max(yMin, fit.intercept + fit.slope * xMax)))}
          stroke={Colors.gray800}
          strokeWidth={2}
          strokeDasharray="5,4"
        />
      )}

      {/* points */}
      {pts.map(([x, y], i) => (
        <Circle key={i} cx={sx(x)} cy={sy(y)} r={4.5} fill={Colors.primary} fillOpacity={0.7} stroke={Colors.white} strokeWidth={1} />
      ))}

      {/* frame */}
      <Rect x={padLeft} y={padTop} width={plotW} height={plotH} stroke={Colors.gray300} strokeWidth={1} fill="none" />
    </Svg>
  );
};

// ---- main -------------------------------------------------------------------
const InsightsModal: React.FC<Props> = ({ visible, classId, className, roster, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<RewardPreferenceStats | null>(null);
  const [names, setNames] = useState<AssessmentName[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [rows, setRows] = useState<DoorsVsAssessmentRow[]>([]);
  const [showRecord, setShowRecord] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const cardWidth = Dimensions.get('window').width - 40 - 32; // modal pad + card pad

  const loadCorrelation = useCallback(
    async (assessmentName: string) => {
      const { data } = await schoolService.getDoorsVsAssessment(classId, assessmentName);
      setRows(data || []);
    },
    [classId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const [prefsRes, namesRes] = await Promise.all([
      schoolService.getRewardPreferenceStats(classId),
      schoolService.getAssessmentNames(),
    ]);
    setPrefs(prefsRes.data);
    const ns = namesRes.data || [];
    setNames(ns);
    const pick =
      selectedName && ns.some((n) => n.assessment_name === selectedName)
        ? selectedName
        : ns[0]?.assessment_name ?? null;
    setSelectedName(pick);
    if (pick) await loadCorrelation(pick);
    else setRows([]);
    setLoading(false);
  }, [classId, selectedName, loadCorrelation]);

  useEffect(() => {
    if (visible) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, classId]);

  const choiceTotal = (prefs?.choice_food ?? 0) + (prefs?.choice_school ?? 0);
  const allTotal = (prefs?.all_food ?? 0) + (prefs?.all_school ?? 0);
  const foodPct = choiceTotal ? Math.round((100 * (prefs?.choice_food ?? 0)) / choiceTotal) : 0;

  const scored = rows.filter((r) => r.score !== null && r.score !== undefined);
  const fit = useMemo(
    () => regression(scored.map((r) => [r.doors_earned, Number(r.score)] as const)),
    [scored]
  );
  const activeCount = rows.filter((r) => r.doors_earned > 0).length;
  const avgScore = scored.length
    ? Math.round(scored.reduce((a, r) => a + Number(r.score), 0) / scored.length)
    : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            backgroundColor: Colors.gray50,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 18,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            maxHeight: '92%',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 }}>Insights</Text>
              <Text style={{ fontSize: 13, color: Colors.gray500, marginTop: 1 }}>
                {className} · {roster.length} student{roster.length === 1 ? '' : 's'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={26} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 56, alignItems: 'center' }}>
              <LoadingSpinner size="large" color={Colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
              {/* KPI row */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
                <Kpi label="Rewards claimed" value={`${allTotal}`} sub="this class" />
                <Kpi label="Chose food" value={choiceTotal ? `${foodPct}%` : '-'} sub="given a free choice" accent />
                <Kpi label="Active" value={`${activeCount}/${roster.length}`} sub="earned doors" />
              </View>

              {/* PREFERENCE ------------------------------------------------ */}
              <SectionLabel icon="fast-food-outline" text="REWARD PREFERENCE" />
              <View style={card}>
                <Text style={cardTitle}>When students could choose either</Text>
                <Text style={cardHint}>
                  Each bar is a reward a student picked after earning a "their choice" door, a revealed preference.
                </Text>
                {choiceTotal === 0 ? (
                  <Empty text='No "their choice" doors have been spent yet.' />
                ) : (
                  <>
                    <SplitBar food={prefs?.choice_food ?? 0} school={prefs?.choice_school ?? 0} />
                    <Legend food={prefs?.choice_food ?? 0} school={prefs?.choice_school ?? 0} />
                    <View style={insightBox}>
                      <Ionicons name="bulb" size={15} color={Colors.primaryDark} style={{ marginTop: 1 }} />
                      <Text style={insightText}>
                        Given a free choice, students picked <Text style={bold}>food {foodPct}%</Text> of the time vs{' '}
                        school {100 - foodPct}% (n = {choiceTotal}).
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={card}>
                <Text style={cardTitle}>All rewards claimed</Text>
                {allTotal === 0 ? (
                  <Empty text="No rewards claimed yet." />
                ) : (
                  <>
                    <SplitBar food={prefs?.all_food ?? 0} school={prefs?.all_school ?? 0} />
                    <Legend food={prefs?.all_food ?? 0} school={prefs?.all_school ?? 0} />
                  </>
                )}
              </View>

              {/* PERFORMANCE ----------------------------------------------- */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <SectionLabel icon="trending-up-outline" text="DOORS vs. PERFORMANCE" noMargin />
                <TouchableOpacity onPress={() => setShowRecord(true)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="create-outline" size={17} color={Colors.primary} />
                  <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 13 }}>Record scores</Text>
                </TouchableOpacity>
              </View>

              {names.length === 0 ? (
                <View style={[card, { marginTop: 12 }]}>
                  <Empty text="Record an assessment (e.g. an EOC) to see whether students who earned more doors scored higher." />
                </View>
              ) : (
                <>
                  {/* assessment picker */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
                    {names.map((n) => {
                      const active = n.assessment_name === selectedName;
                      return (
                        <TouchableOpacity
                          key={n.assessment_name}
                          onPress={() => {
                            setSelectedName(n.assessment_name);
                            loadCorrelation(n.assessment_name);
                          }}
                          activeOpacity={0.8}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 999,
                            backgroundColor: active ? Colors.primary : Colors.white,
                            borderWidth: 1,
                            borderColor: active ? Colors.primary : Colors.gray200,
                          }}
                        >
                          <Text style={{ color: active ? Colors.white : Colors.gray700, fontWeight: '600', fontSize: 13 }}>
                            {n.assessment_name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={card}>
                    {/* correlation headline */}
                    {fit ? (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: 4 }}>
                        <View>
                          <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.primary, letterSpacing: -1 }}>
                            {fit.r >= 0 ? '+' : ''}{fit.r.toFixed(2)}
                          </Text>
                          <Text style={statCaption}>correlation (r)</Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray700 }}>
                            {Math.round(fit.r2 * 100)}%
                          </Text>
                          <Text style={statCaption}>variance (R²)</Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.gray700 }}>{avgScore ?? '-'}</Text>
                          <Text style={statCaption}>avg score</Text>
                        </View>
                      </View>
                    ) : (
                      <Empty text="Need at least 3 students with a recorded score to chart a relationship." />
                    )}

                    {scored.length >= 3 && <ScatterPlot rows={rows} fit={fit} width={cardWidth} />}

                    {fit && (
                      <>
                        <Text style={{ fontSize: 13, color: Colors.gray700, lineHeight: 19, marginTop: 6 }}>
                          There is <Text style={bold}>{strength(fit.r)}</Text> relationship between doors earned and{' '}
                          {selectedName} score (n = {fit.n}). Each extra ~{Math.max(1, Math.round(1 / Math.max(0.01, fit.slope)))} doors
                          tracks with about 1 more point.
                        </Text>
                        <View style={[insightBox, { backgroundColor: Colors.gray100 }]}>
                          <Ionicons name="alert-circle-outline" size={15} color={Colors.gray500} style={{ marginTop: 1 }} />
                          <Text style={[insightText, { color: Colors.gray600 }]}>
                            Correlation isn't causation. Engaged students may both earn doors and study more. To test impact,
                            compare matched sections where door access differs.
                          </Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* per-student table (collapsible) */}
                  <TouchableOpacity
                    onPress={() => setShowTable((s) => !s)}
                    activeOpacity={0.8}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10 }}
                  >
                    <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 13 }}>
                      {showTable ? 'Hide' : 'Show'} per-student data
                    </Text>
                    <Ionicons name={showTable ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.primary} />
                  </TouchableOpacity>

                  {showTable && (
                    <View style={card}>
                      <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray200 }}>
                        <Text style={[colHead, { flex: 1 }]}>Student</Text>
                        <Text style={[colHead, { width: 64, textAlign: 'right' }]}>Doors</Text>
                        <Text style={[colHead, { width: 64, textAlign: 'right' }]}>Score</Text>
                      </View>
                      {rows.map((r) => (
                        <View key={r.student_id} style={{ flexDirection: 'row', paddingVertical: 7 }}>
                          <Text style={{ flex: 1, fontSize: 14, color: Colors.gray800 }} numberOfLines={1}>
                            {rowName(r)}
                          </Text>
                          <Text style={{ width: 64, textAlign: 'right', fontSize: 14, color: Colors.gray700 }}>{r.doors_earned}</Text>
                          <Text style={{ width: 64, textAlign: 'right', fontSize: 14, color: r.score === null ? Colors.gray400 : Colors.gray700 }}>
                            {r.score === null ? '-' : `${r.score}${r.max_score ? `/${r.max_score}` : ''}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}

              <View style={{ height: 8 }} />
            </ScrollView>
          )}
        </View>
      </View>

      <RecordScoresModal
        visible={showRecord}
        classId={classId}
        roster={roster}
        initialName={selectedName ?? undefined}
        onClose={() => setShowRecord(false)}
        onSaved={(savedName) => {
          setShowRecord(false);
          setSelectedName(savedName);
          load();
        }}
      />
    </Modal>
  );
};

// ---- small pieces -----------------------------------------------------------
const Kpi: React.FC<{ label: string; value: string; sub: string; accent?: boolean }> = ({ label, value, sub, accent }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: accent ? Colors.primary : Colors.white,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: accent ? Colors.primary : Colors.gray200,
    }}
  >
    <Text style={{ fontSize: 11, fontWeight: '600', color: accent ? 'rgba(255,255,255,0.85)' : Colors.gray500 }} numberOfLines={1}>
      {label}
    </Text>
    <Text style={{ fontSize: 24, fontWeight: '800', color: accent ? Colors.white : Colors.gray900, marginTop: 4, letterSpacing: -0.5 }}>
      {value}
    </Text>
    <Text style={{ fontSize: 10.5, color: accent ? 'rgba(255,255,255,0.8)' : Colors.gray400, marginTop: 1 }} numberOfLines={1}>
      {sub}
    </Text>
  </View>
);

const SectionLabel: React.FC<{ icon: keyof typeof Ionicons.glyphMap; text: string; noMargin?: boolean }> = ({ icon, text, noMargin }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: noMargin ? 0 : 10 }}>
    <Ionicons name={icon} size={14} color={Colors.gray500} />
    <Text style={{ fontSize: 12, fontWeight: '800', color: Colors.gray500, letterSpacing: 0.6 }}>{text}</Text>
  </View>
);

const SplitBar: React.FC<{ food: number; school: number }> = ({ food, school }) => {
  const total = food + school || 1;
  const foodPct = (100 * food) / total;
  return (
    <View style={{ height: 26, borderRadius: 13, overflow: 'hidden', flexDirection: 'row', backgroundColor: Colors.gray200, marginTop: 12, marginBottom: 10 }}>
      {food > 0 && (
        <View style={{ width: `${foodPct}%`, backgroundColor: Colors.primary, justifyContent: 'center', paddingLeft: 10 }}>
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '800' }}>{Math.round(foodPct)}%</Text>
        </View>
      )}
      {school > 0 && (
        <View style={{ flex: 1, backgroundColor: Colors.successDark, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10 }}>
          <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '800' }}>{Math.round(100 - foodPct)}%</Text>
        </View>
      )}
    </View>
  );
};

const Legend: React.FC<{ food: number; school: number }> = ({ food, school }) => (
  <View style={{ flexDirection: 'row', gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: Colors.primary }} />
      <Text style={{ fontSize: 12.5, color: Colors.gray600 }}>Food · {food}</Text>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: Colors.successDark }} />
      <Text style={{ fontSize: 12.5, color: Colors.gray600 }}>School · {school}</Text>
    </View>
  </View>
);

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <Text style={{ fontSize: 13, color: Colors.gray500, lineHeight: 19, marginTop: 6 }}>{text}</Text>
);

const card = {
  backgroundColor: Colors.white,
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: Colors.gray200,
};

const cardTitle = {
  fontSize: 15,
  fontWeight: '700' as const,
  color: Colors.gray900,
};

const cardHint = {
  fontSize: 12,
  color: Colors.gray500,
  marginTop: 2,
  lineHeight: 17,
};

const statCaption = {
  fontSize: 11,
  color: Colors.gray500,
  marginTop: 1,
};

const insightBox = {
  flexDirection: 'row' as const,
  gap: 8,
  backgroundColor: Colors.primaryMuted,
  borderRadius: 10,
  padding: 10,
  marginTop: 12,
};

const insightText = {
  flex: 1,
  fontSize: 12.5,
  color: Colors.primaryDark,
  lineHeight: 18,
};

const bold = { fontWeight: '800' as const };

const colHead = {
  fontSize: 11,
  fontWeight: '700' as const,
  color: Colors.gray500,
  letterSpacing: 0.3,
};

export default InsightsModal;
