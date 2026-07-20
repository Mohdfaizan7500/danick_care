import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Platform,
    Dimensions,
    ActivityIndicator,
    Vibration,
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Toast from 'react-native-toast-message'
import { useNavigation, useRoute } from '@react-navigation/native'
// import { RescheduleComplaint } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'
import dummyData from '../../../lib/dummyData';

const { width } = Dimensions.get('window')

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Build 15 date objects starting from today - WITH CURRENT SLOT DATE SELECTED
const buildDates = (currentSlotDate = null) => {
    const today = new Date()
    const dates = []

    // Parse current slot date if exists (format: "DD-MM-YYYY")
    let currentDateObj = null
    if (currentSlotDate) {
        try {
            const parts = currentSlotDate.split('-')
            if (parts.length === 3) {
                const day = parseInt(parts[0])
                const month = parseInt(parts[1]) - 1
                const year = parseInt(parts[2])
                currentDateObj = new Date(year, month, day)
            }
        } catch (e) {
        }
    }

    for (let i = 0; i < 15; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)

        const isToday = i === 0
        let isSelected = false

        // Check if this date matches the current slot date
        if (currentDateObj) {
            if (d.getDate() === currentDateObj.getDate() &&
                d.getMonth() === currentDateObj.getMonth() &&
                d.getFullYear() === currentDateObj.getFullYear()) {
                isSelected = true
            }
        }

        dates.push({
            id: i,
            fullDate: d,
            day: DAY_NAMES[d.getDay()],
            dateNumber: d.getDate(),
            month: MONTH_NAMES[d.getMonth()],
            year: d.getFullYear(),
            isToday: isToday,
            isSelected: isSelected,
        })
    }
    return dates
}

const TIME_SLOTS = [
    { id: 1, time: '8:00 AM – 11:00 AM', icon: 'weather-sunny', available: true },
    { id: 2, time: '11:00 AM – 2:00 PM', icon: 'weather-partly-cloudy', available: true },
    { id: 3, time: '2:00 PM – 5:00 PM', icon: 'weather-sunset', available: true },
    { id: 4, time: '5:00 PM – 8:00 PM', icon: 'weather-night', available: true },
]

const Reschedule = () => {
    const [dates, setDates] = useState([])
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [remark, setRemark] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [currentSlotInfo, setCurrentSlotInfo] = useState(null)
    const scrollRef = useRef(null)
    const { user } = useAuth();

    const navigation = useNavigation();
    const route = useRoute();
    const { complaintData, isVerified, fromScreen } = route.params || {};

    useEffect(() => {
        // Build dates with current slot date pre-selected
        const week = buildDates(complaintData?.slot_date)
        setDates(week)

        // Find and set the pre-selected date
        const preSelected = week.find(d => d.isSelected)
        if (preSelected) {
            setSelectedDate(preSelected)
        } else if (week.length > 0) {
            // If no current slot date matches, select the first date (today)
            setSelectedDate(week[0])
            setDates(prev => prev.map((d, index) => ({
                ...d,
                isSelected: index === 0
            })))
        }

        // Pre-select the current slot time if available
        if (complaintData?.slot_time) {
            const matchedSlot = TIME_SLOTS.find(slot => slot.time === complaintData.slot_time)
            if (matchedSlot) {
                setSelectedSlot(matchedSlot)
            }
            setCurrentSlotInfo({
                date: complaintData.slot_date,
                time: complaintData.slot_time
            })
        }

        // Pre-fill remark with current remark if available
        if (complaintData?.remark) {
            setRemark(complaintData.remark)
        }
    }, [complaintData])

    const handleDateSelect = (dateItem) => {
        setDates(prev => prev.map(d => ({ ...d, isSelected: d.id === dateItem.id })))
        setSelectedDate(dateItem)
        setSelectedSlot(null) // Reset slot selection when date changes
    }

    const handleSlotSelect = (slot) => {
        if (!slot.available) {
            Toast.show({
                type: 'error',
                text1: 'Slot Unavailable',
                text2: 'Please select an available time slot',
                position: 'top',
                visibilityTime: 2000,
                topOffset: 50,
            })
            return
        }
        setSelectedSlot(slot)
    }

    const handleSubmit = async () => {
        if (!selectedDate) {
            Toast.show({
                type: 'error',
                text1: 'Date Required',
                text2: 'Please select a date',
                position: 'top',
                visibilityTime: 2000,
                topOffset: 50
            })
            return
        }
        if (!selectedSlot) {
            Toast.show({
                type: 'error',
                text1: 'Time Slot Required',
                text2: 'Please select a time slot',
                position: 'top',
                visibilityTime: 2000,
                topOffset: 50
            })
            return
        }

        // Check if remark is provided (mandatory)
        if (!remark.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Remark Required',
                text2: 'Please provide a reason for rescheduling',
                position: 'top',
                visibilityTime: 2000,
                topOffset: 50,
            })
            return
        }

        // Check if complaintData exists
        if (!complaintData || !complaintData.id) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Complaint data not found',
                position: 'top',
                visibilityTime: 2000,
                topOffset: 50,
            })
            return
        }

        // Format date for API (YYYY-MM-DD)
        const year = selectedDate.fullDate.getFullYear()
        const month = String(selectedDate.fullDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.fullDate.getDate()).padStart(2, '0')
        const formattedDate = `${year}-${month}-${day}`

        // Prepare payload
        const payload = {
            complaint_id: complaintData.id.toString(),
            slot_date: formattedDate,
            slot_time: selectedSlot.time,
            remark: remark.trim(),
            technician_id: user?.id,
            status: complaintData?.status

        }


        setIsLoading(true)
        try {
            // const response = await RescheduleComplaint(payload)
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.rescheduleComplaint;

            if (response?.data?.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Rescheduled Successfully!',
                    text2: response?.data?.msg || `Complaint rescheduled to ${formattedDate}`,
                    position: 'top',
                    visibilityTime: 3000,
                    topOffset: 50,
                })

                // Navigate back after 1.5 seconds
                setTimeout(() => {
                    navigation.goBack();
                }, 500)
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Reschedule Failed',
                    text2: response?.data?.msg || 'Failed to reschedule complaint',
                    position: 'top',
                    visibilityTime: 3000,
                    topOffset: 50,
                })
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to reschedule complaint',
                position: 'top',
                visibilityTime: 3000,
                topOffset: 50,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const formatSelectedDate = () => {
        if (!selectedDate) return 'Not selected'
        if (selectedDate.isToday) return `Today · ${selectedDate.dateNumber} ${selectedDate.month}`
        return `${selectedDate.day}, ${selectedDate.dateNumber} ${selectedDate.month} ${selectedDate.year}`
    }

    const formatCurrentSlotDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            const parts = dateStr.split('-')
            if (parts.length === 3) {
                const day = parseInt(parts[0])
                const month = parseInt(parts[1]) - 1
                const year = parseInt(parts[2])
                const d = new Date(year, month, day)
                return `${DAY_NAMES[d.getDay()]}, ${day} ${MONTH_NAMES[month]} ${year}`
            }
        } catch (e) {
            return dateStr
        }
        return dateStr
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* ── Header ─────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reschedule</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Complaint Info */}
                {complaintData && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Complaint #{complaintData.id}</Text>
                        <Text style={styles.infoText}>{complaintData.service_name}</Text>
                        <Text style={styles.infoSubText}>CSN: {complaintData.csn}</Text>
                    </View>
                )}

                {/* Current Slot Info */}
                {/* {currentSlotInfo && (
                    <View style={styles.currentSlotCard}>
                        <View style={styles.currentSlotHeader}>
                            <Icon name="clock-alert-outline" size={18} color="#F59E0B" />
                            <Text style={styles.currentSlotTitle}>Current Slot</Text>
                        </View>
                        <Text style={styles.currentSlotText}>
                            📅 {formatCurrentSlotDate(currentSlotInfo.date)}
                        </Text>
                        <Text style={styles.currentSlotText}>
                            ⏰ {currentSlotInfo.time}
                        </Text>
                    </View>
                )} */}

                {/* ── Section label ──────────────────────────── */}
                <Text style={styles.sectionLabel}>Pick a new date</Text>

                {/* ── Date Strip (15 days) ──────────────────────── */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateStrip}
                    decelerationRate="fast"
                    snapToInterval={DATE_CARD_WIDTH + DATE_CARD_GAP}
                    snapToAlignment="start"
                >
                    {dates.map((date) => {
                        const sel = date.isSelected
                        const today = date.isToday

                        return (
                            <TouchableOpacity
                                key={date.id}
                                style={[
                                    styles.dateCard,
                                    sel && styles.dateCardSelected,
                                    !sel && today && styles.dateCardToday,
                                ]}
                                onPress={() => {
                                    Vibration.vibrate(50);
                                    handleDateSelect(date)
                                }}
                                activeOpacity={0.75}
                            >
                                {/* Week label */}
                                <Text style={[styles.dateDayLabel, sel && styles.textOnTeal]}>
                                    {today ? 'TODAY' : date.day.toUpperCase()}
                                </Text>

                                {/* Date bubble */}
                                <View style={[styles.dateBubble, sel && styles.dateBubbleSelected]}>
                                    <Text style={[styles.dateBubbleText, sel && styles.dateBubbleTextSelected]}>
                                        {date.dateNumber}
                                    </Text>
                                </View>

                                {/* Month */}
                                <Text style={[styles.dateMonthLabel, sel && styles.textOnTeal]}>
                                    {date.month}
                                </Text>

                                {/* Bottom dot when selected */}
                                {sel && <View style={styles.selectedDot} />}
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>

                {/* ── Selected date and time display ─────────────────────── */}


                {/* ── Time Slots (2 columns) ─────────────────────────────── */}
                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Choose a new time slot</Text>
                <View style={styles.slotsGrid}>
                    {TIME_SLOTS.map((slot) => {
                        const active = selectedSlot?.id === slot.id
                        return (
                            <TouchableOpacity
                                key={slot.id}
                                style={[
                                    styles.slotCard,
                                    active && styles.slotCardActive,
                                    !slot.available && styles.slotCardDisabled,
                                ]}
                                onPress={() => {
                                    Vibration.vibrate(50);
                                    handleSlotSelect(slot)
                                }}
                                disabled={!slot.available}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.slotIcon, active && styles.slotIconActive]}>
                                    <Icon name={slot.icon} size={18} color={active ? '#14B8A6' : '#9CA3AF'} />
                                </View>
                                <Text style={[styles.slotTime, active && styles.slotTimeActive]}>
                                    {slot.time}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {/* ── Remark (Mandatory) ─────────────────────────────────── */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                    Remark <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.remarkBox}>
                    <TextInput
                        style={styles.remarkInput}
                        placeholder="Please provide a reason for rescheduling..."
                        placeholderTextColor="#C0C4CC"
                        value={remark}
                        onChangeText={setRemark}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <TouchableOpacity
                        onPress={() => setRemark('Rescheduled to 2024-01-15')}
                        className="bg-amber-400 px-2 py-1 rounded-md ml-2"
                    >
                        <Text className="text-xs font-bold text-white">Demo</Text>
                    </TouchableOpacity>
                    <Text style={styles.remarkCount}>
                        {remark.length}/200
                    </Text>
                </View>
                {!remark.trim() && (
                    <Text style={styles.requiredText}>* Remark is required</Text>
                )}

                {/* ── Submit ─────────────────────────────────── */}
                <TouchableOpacity
                    style={[
                        styles.submitBtn,
                        (!selectedDate || !selectedSlot || !remark.trim() || isLoading) && styles.submitBtnDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedDate || !selectedSlot || !remark.trim() || isLoading}
                    activeOpacity={0.85}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Text style={styles.submitBtnText}>Confirm Reschedule</Text>
                            <Icon name="arrow-right" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>

            <Toast />
        </SafeAreaView>
    )
}

export default Reschedule

// ─── Constants ───────────────────────────────────────────────────────────────
const DATE_CARD_WIDTH = 60
const DATE_CARD_GAP = 10

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 18,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: 0.2,
    },

    // ── Info Card
    infoCard: {
        backgroundColor: '#F0FDFA',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#CCFBF1',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0D9488',
        marginBottom: 2,
    },
    infoText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    infoSubText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },

    // ── Current Slot Card
    currentSlotCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    currentSlotHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    currentSlotTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
        marginLeft: 6,
    },
    currentSlotText: {
        fontSize: 13,
        color: '#78350F',
        marginTop: 2,
        fontWeight: '500',
    },

    // ── Scroll
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },

    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 14,
    },

    // ── Date strip
    dateStrip: {
        paddingRight: 20,
        paddingBottom: 4,
        paddingLeft: 2,
    },
    dateCard: {
        width: DATE_CARD_WIDTH,
        marginRight: DATE_CARD_GAP,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    dateCardSelected: {
        backgroundColor: '#14B8A6',
        borderColor: '#14B8A6',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 6,
    },
    dateCardToday: {
        borderColor: '#99F6E4',
        backgroundColor: '#F0FDFA',
    },
    dateDayLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.6,
        marginBottom: 6,
    },
    dateBubble: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    dateBubbleSelected: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    dateBubbleText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    dateBubbleTextSelected: {
        color: '#FFFFFF',
    },
    dateMonthLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    textOnTeal: {
        color: 'rgba(255,255,255,0.85)',
    },
    selectedDot: {
        position: 'absolute',
        bottom: 5,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },

    // ── Selection Summary
    selectionSummary: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        marginTop: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    selectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginLeft: 8,
        marginRight: 4,
    },
    selectionValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1E293B',
        flex: 1,
    },
    notSelectedText: {
        color: '#9CA3AF',
        fontStyle: 'italic',
    },

    // ── Time slots (2 columns)
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    slotCard: {
        width: (width - 50) / 2,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    slotCardActive: {
        borderColor: '#14B8A6',
        backgroundColor: '#F0FDFA',
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    slotCardDisabled: {
        opacity: 0.4,
    },
    slotIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    slotIconActive: {
        backgroundColor: '#CCFBF1',
    },
    slotTime: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        lineHeight: 16,
    },
    slotTimeActive: {
        color: '#0D9488',
    },

    // ── Remark
    remarkBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 110,
        position: 'relative',
    },
    remarkInput: {
        fontSize: 14,
        color: '#1A1A1A',
        lineHeight: 22,
        minHeight: 80,
        padding: 0,
        ...(Platform.OS === 'ios' && { paddingVertical: 4 }),
    },
    remarkCount: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: 4,
    },
    requiredStar: {
        color: '#EF4444',
        fontWeight: '700',
    },
    requiredText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },

    // ── Submit
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#14B8A6',
        borderRadius: 16,
        paddingVertical: 17,
        marginTop: 28,
        gap: 8,
        shadowColor: '#14B8A6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 6,
    },
    submitBtnDisabled: {
        opacity: 0.45,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
})
