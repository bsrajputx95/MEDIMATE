import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAssistant } from '@/contexts/AssistantContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Bell,
  Camera,
  Video,
  FileText,
  Stethoscope,
  Users,
  TrendingUp,
  ChevronRight,
  Pill,
  Heart,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import AppointmentCard from '../../components/cura/AppointmentCard';
import TestReportCard from '../../components/cura/TestReportCard';
import MedicationCard from '../../components/cura/MedicationCard';
import DoctorCard from '../../components/cura/DoctorCard';
import TreatmentPlanCard from '../../components/cura/TreatmentPlanCard';
import AppointmentBookingModal from '../../components/cura/AppointmentBookingModal';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '@/constants/design-tokens';
import { StatCard, SectionHeader, Card } from '@/components/ui';
import { 
  useCuraOverview, 
  useAppointments, 
  useMedications, 
  useTestReports, 
  useDoctors, 
  useTreatmentPlans 
} from '@/hooks';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkeletonStatCard, SkeletonCard } from '@/components/ui/Skeleton';

const { width } = Dimensions.get('window');

type TabType = 'overview' | 'appointments' | 'tests' | 'medications' | 'doctors' | 'treatments';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  index: number;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ title, subtitle, icon, color, onPress, index }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150, mass: 0.8 });
    opacity.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        style={[styles.quickActionCard, { borderLeftColor: color }]} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CuraScreen() {
  const { setCurrentScreen } = useAssistant();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // API Data Hooks
  const overview = useCuraOverview();
  const { 
    appointments, 
    upcomingAppointments, 
    isLoading: appointmentsLoading, 
    refetch: refetchAppointments,
    cancelAppointment,
    createAppointment,
  } = useAppointments();
  const { 
    medications, 
    todaysMedications, 
    takenCount, 
    totalMedications, 
    isLoading: medicationsLoading, 
    refetch: refetchMedications,
    toggleMedicationTaken,
  } = useMedications();
  const { 
    reports, 
    isLoading: reportsLoading, 
    refetch: refetchReports 
  } = useTestReports();
  const { 
    doctors, 
    isLoading: doctorsLoading, 
    refetch: refetchDoctors 
  } = useDoctors();
  const { 
    plans, 
    isLoading: plansLoading, 
    refetch: refetchPlans 
  } = useTreatmentPlans();

  useFocusEffect(
    useCallback(() => {
      setCurrentScreen('CURA');
    }, [setCurrentScreen])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([
      refetchAppointments(),
      refetchMedications(),
      refetchReports(),
      refetchDoctors(),
      refetchPlans(),
    ]);
    setRefreshing(false);
  }, [refetchAppointments, refetchMedications, refetchReports, refetchDoctors, refetchPlans]);

  const handleBookAppointment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowBookingModal(true);
  };

  const handleBookAppointmentSubmit = async (appointmentData: {
    doctorId: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
  }) => {
    await createAppointment.mutate(appointmentData);
    await refetchAppointments();
  };

  const handleJoinConsult = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Start video consultation
  };

  const handleScanReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Open camera for report scanning
  };

  const handleUploadReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Open file picker
  };

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleToggleMedication = useCallback(async (id: string) => {
    const medication = medications.find(m => m.id === id);
    if (medication) {
      await toggleMedicationTaken.mutate({ id, taken: !medication.taken });
    }
  }, [medications, toggleMedicationTaken]);

  const handleCancelAppointment = useCallback(async (id: string) => {
    await cancelAppointment.mutate({ id });
  }, [cancelAppointment]);

  const isLoading = appointmentsLoading || medicationsLoading || reportsLoading || doctorsLoading || plansLoading;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Stats Section */}
            <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.statsSection}>
              <SectionHeader title="Health Overview" />
              {isLoading ? (
                <View style={styles.statsGrid}>
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                </View>
              ) : (
                <View style={styles.statsGrid}>
                  <StatCard
                    title="Appointments"
                    value={overview.stats.appointments.toString()}
                    icon={<Calendar size={20} color={COLORS.primary} />}
                    color={COLORS.primary}
                  />
                  <StatCard
                    title="Medications"
                    value={overview.stats.medications.toString()}
                    icon={<Pill size={20} color={COLORS.success} />}
                    color={COLORS.success}
                  />
                  <StatCard
                    title="Test Reports"
                    value={overview.stats.testReports.toString()}
                    icon={<FileText size={20} color={COLORS.warning} />}
                    color={COLORS.warning}
                  />
                  <StatCard
                    title="Doctors"
                    value={overview.stats.doctors.toString()}
                    icon={<Stethoscope size={20} color={COLORS.error} />}
                    color={COLORS.error}
                  />
                </View>
              )}
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
              <SectionHeader title="Quick Actions" />
              <View style={styles.quickActionsGrid}>
                <QuickActionCard
                  title="Book Appointment"
                  subtitle="Schedule with doctors"
                  icon={<Calendar size={22} color={COLORS.primary} />}
                  color={COLORS.primary}
                  onPress={handleBookAppointment}
                  index={0}
                />
                <QuickActionCard
                  title="Join Consultation"
                  subtitle="Video/Audio call"
                  icon={<Video size={22} color={COLORS.success} />}
                  color={COLORS.success}
                  onPress={handleJoinConsult}
                  index={1}
                />
                <QuickActionCard
                  title="Scan Report"
                  subtitle="Upload test results"
                  icon={<Camera size={22} color={COLORS.warning} />}
                  color={COLORS.warning}
                  onPress={handleScanReport}
                  index={2}
                />
                <QuickActionCard
                  title="Upload Files"
                  subtitle="Add medical documents"
                  icon={<FileText size={22} color={COLORS.error} />}
                  color={COLORS.error}
                  onPress={handleUploadReport}
                  index={3}
                />
              </View>
            </Animated.View>

            {/* Upcoming Appointments */}
            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
              <SectionHeader 
                title="Upcoming Appointments" 
                actionLabel="See All" 
                onAction={() => handleTabChange('appointments')} 
              />
              {upcomingAppointments.slice(0, 2).map((appointment, index) => (
                <Animated.View 
                  key={appointment.id} 
                  entering={FadeInDown.delay(350 + index * 50).springify()}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onEdit={() => {}}
                    onCancel={() => handleCancelAppointment(appointment.id)}
                    onJoinCall={() => {}}
                  />
                </Animated.View>
              ))}
              {upcomingAppointments.length === 0 && !isLoading && (
                <Card variant="outlined" padding="lg">
                  <Text style={styles.emptyText}>No upcoming appointments</Text>
                </Card>
              )}
            </Animated.View>

            {/* Today's Medications */}
            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.section}>
              <SectionHeader 
                title="Today's Medications" 
                actionLabel="See All" 
                onAction={() => handleTabChange('medications')} 
              />
              {todaysMedications.slice(0, 2).map((medication, index) => (
                <Animated.View 
                  key={medication.id} 
                  entering={FadeInDown.delay(450 + index * 50).springify()}
                >
                  <MedicationCard
                    medication={medication}
                    onToggleTaken={() => handleToggleMedication(medication.id)}
                    onSetReminder={() => {}}
                  />
                </Animated.View>
              ))}
              {todaysMedications.length === 0 && !isLoading && (
                <Card variant="outlined" padding="lg">
                  <Text style={styles.emptyText}>No medications for today</Text>
                </Card>
              )}
            </Animated.View>

            {/* Health Tip Card */}
            <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.section}>
              <Card variant="filled" padding="lg" style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={styles.tipIconContainer}>
                    <Heart size={20} color={COLORS.error} />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Daily Health Tip</Text>
                    <Text style={styles.tipText}>
                      Remember to take your medications at the same time each day for best results.
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          </View>
        );

      case 'appointments':
        return (
          <View style={styles.tabContent}>
            <SectionHeader title="All Appointments" />
            {appointments.map((appointment, index) => (
              <Animated.View 
                key={appointment.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <AppointmentCard
                  appointment={appointment}
                  onEdit={() => {}}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                  onJoinCall={() => {}}
                />
              </Animated.View>
            ))}
            {appointments.length === 0 && !isLoading && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No appointments found</Text>
              </Card>
            )}
          </View>
        );

      case 'tests':
        return (
          <View style={styles.tabContent}>
            <SectionHeader title="Test Reports" />
            {reports.map((report, index) => (
              <Animated.View 
                key={report.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <TestReportCard
                  report={report}
                  onView={() => {}}
                  onDownload={() => {}}
                />
              </Animated.View>
            ))}
            {reports.length === 0 && !isLoading && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No test reports found</Text>
              </Card>
            )}
          </View>
        );

      case 'medications':
        return (
          <View style={styles.tabContent}>
            <SectionHeader title="Medications" />
            {medications.map((medication, index) => (
              <Animated.View 
                key={medication.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <MedicationCard
                  medication={medication}
                  onToggleTaken={() => handleToggleMedication(medication.id)}
                  onSetReminder={() => {}}
                />
              </Animated.View>
            ))}
            {medications.length === 0 && !isLoading && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No medications found</Text>
              </Card>
            )}
          </View>
        );

      case 'doctors':
        return (
          <View style={styles.tabContent}>
            <SectionHeader title="Doctor Directory" />
            {doctors.map((doctor, index) => (
              <Animated.View 
                key={doctor.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <DoctorCard
                  doctor={doctor}
                  onBookAppointment={() => {}}
                  onViewProfile={() => {}}
                />
              </Animated.View>
            ))}
            {doctors.length === 0 && !isLoading && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No doctors found</Text>
              </Card>
            )}
          </View>
        );

      case 'treatments':
        return (
          <View style={styles.tabContent}>
            <SectionHeader title="Treatment Plans" />
            {plans.map((plan, index) => (
              <Animated.View 
                key={plan.id} 
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <TreatmentPlanCard
                  plan={plan}
                  onViewDetails={() => {}}
                />
              </Animated.View>
            ))}
            {plans.length === 0 && !isLoading && (
              <Card variant="outlined" padding="lg">
                <Text style={styles.emptyText}>No treatment plans found</Text>
              </Card>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'tests', label: 'Tests', icon: FileText },
    { key: 'medications', label: 'Meds', icon: Pill },
    { key: 'doctors', label: 'Doctors', icon: Users },
    { key: 'treatments', label: 'Treatments', icon: Stethoscope },
  ];

  return (
    <ErrorBoundary>
      <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + SPACING[3] }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>CURA</Text>
            <Text style={styles.headerSubtitle}>Medication & Treatment Tracking</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              accessibilityLabel="Search"
            >
              <Search size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              accessibilityLabel="Filter"
            >
              <Filter size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton} 
              accessibilityLabel="Notifications"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Bell size={20} color={COLORS.primary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <Animated.View entering={FadeIn.delay(100).springify()} style={styles.tabNavigation}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  isActive && styles.activeTabButton
                ]}
                onPress={() => handleTabChange(tab.key as TabType)}
                activeOpacity={0.8}
              >
                <Icon 
                  size={16} 
                  color={isActive ? COLORS.textInverse : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.tabButtonText,
                  isActive && styles.activeTabButtonText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 80 }]} 
        onPress={handleBookAppointment} 
        accessibilityLabel="Book new appointment"
        activeOpacity={0.9}
      >
        <Plus size={24} color={COLORS.textInverse} />
      </TouchableOpacity>

      {/* Booking Modal */}
      <AppointmentBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        doctors={doctors}
        onBook={handleBookAppointmentSubmit}
      />
    </View>
    </ErrorBoundary>
  );
}

// Need to import Dimensions
import { Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: SPACING[4],
    paddingHorizontal: SPACING[5],
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  tabNavigation: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabScrollContent: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    gap: SPACING[2],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    gap: SPACING[2],
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  activeTabButtonText: {
    color: COLORS.textInverse,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  tabContent: {
    padding: SPACING[5],
  },
  statsSection: {
    marginBottom: SPACING[6],
  },
  section: {
    marginBottom: SPACING[6],
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  quickActionsGrid: {
    gap: SPACING[3],
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[4],
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 4,
    gap: SPACING[4],
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING[1],
  },
  quickActionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: COLORS.errorMuted,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[4],
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#991B1B',
    marginBottom: SPACING[2],
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: '#991B1B',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: SPACING[5],
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
});
