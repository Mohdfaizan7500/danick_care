import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'
import Header from '../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'

const TermsConditions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <Header 
        title={'Terms & Conditions'}
        titlePosition='left'
        titleStyle='font-bold text-xl text-text-primary'
      />
      
      <ScrollView 
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card with Last Updated */}
        <View className="bg-gradient-to-r from-primary-sage to-primary-sage400 rounded-xl p-4 mb-6">
          <Text className="text-dark font-bold text-lg mb-1">
            AC Service Center Terms
          </Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-white mr-2 opacity-70" />
            <Text className="text-dark opacity-90 text-sm">
              Last Updated: March 13, 2026
            </Text>
          </View>
        </View>

        {/* Service Agreement Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">1. Service Agreement</Text>
          </View>
          
          <View className="bg-ui-card rounded-xl p-4 border border-ui-border">
            <Text className="text-text-secondary leading-6">
              By booking our AC services, you agree to provide accurate information about your AC unit, 
              including brand, model, and issue description. Our technicians will diagnose and repair 
              based on the information provided.
            </Text>
          </View>
        </View>

        {/* Pricing & Payment Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">2. Pricing & Payment</Text>
          </View>
          
          <View className="bg-ui-card rounded-xl p-4 border border-ui-border space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-text-primary font-medium">Service Visit Fee</Text>
              <View className="bg-primary-sage50 px-3 py-1 rounded-full">
                <Text className="text-primary-sage700 text-sm">₹499</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-text-primary font-medium">Diagnostic Charge</Text>
              <Text className="text-text-secondary">Free with service</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-text-primary font-medium">Repair Cost</Text>
              <Text className="text-text-secondary">As quoted after inspection</Text>
            </View>
            
            <View className="border-t border-ui-border my-2" />
            
            <Text className="text-text-secondary text-sm">
              * Payment is due upon completion of service. We accept cash, UPI, and card payments.
            </Text>
          </View>
        </View>

        {/* Warranty Terms Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">3. Warranty Coverage</Text>
          </View>
          
          <View className="bg-ui-card rounded-xl p-4 border border-ui-border">
            <View className="flex-row flex-wrap mb-3">
              <View className="bg-status-active/10 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-status-active text-sm">30 Days Service Warranty</Text>
              </View>
              <View className="bg-status-active/10 px-3 py-1 rounded-full mb-2">
                <Text className="text-status-active text-sm">6 Months on Spare Parts</Text>
              </View>
            </View>
            
            <Text className="text-text-secondary mb-2">✓ Free re-service if same issue recurs within warranty</Text>
            <Text className="text-text-secondary mb-2">✓ Warranty covers only replaced parts</Text>
            <Text className="text-text-secondary">✗ Warranty void if tampered by unauthorized personnel</Text>
          </View>
        </View>

        {/* Cancellation & Rescheduling */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">4. Cancellation Policy</Text>
          </View>
          
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-ui-card rounded-xl p-3 border border-ui-border">
              <Text className="text-text-primary font-medium text-center mb-1">Free</Text>
              <Text className="text-text-tertiary text-xs text-center">Before 24 hours</Text>
            </View>
            
            <View className="flex-1 bg-ui-card rounded-xl p-3 border border-ui-border">
              <Text className="text-text-primary font-medium text-center mb-1">50% Charge</Text>
              <Text className="text-text-tertiary text-xs text-center">12-24 hours prior</Text>
            </View>
            
            <View className="flex-1 bg-ui-card rounded-xl p-3 border border-ui-border">
              <Text className="text-text-primary font-medium text-center mb-1">Full Charge</Text>
              <Text className="text-text-tertiary text-xs text-center">Less than 12 hours</Text>
            </View>
          </View>
        </View>

        {/* Service Specific Terms */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">5. AC Service Specifics</Text>
          </View>
          
          <View className="bg-ui-card rounded-xl p-4 border border-ui-border">
            <View className="flex-row items-center mb-3">
              <View className="bg-primary-sage w-6 h-6 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs">✓</Text>
              </View>
              <Text className="text-text-primary flex-1">Gas refilling includes leak test</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <View className="bg-primary-sage w-6 h-6 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs">✓</Text>
              </View>
              <Text className="text-text-primary flex-1">Deep cleaning includes coil & filter cleaning</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <View className="bg-primary-sage w-6 h-6 rounded-full items-center justify-center mr-2">
                <Text className="text-white text-xs">✓</Text>
              </View>
              <Text className="text-text-primary flex-1">Compressor repair carries 90-day warranty</Text>
            </View>
            
            <View className="bg-status-away/10 p-3 rounded-lg mt-2">
              <Text className="text-status-away text-sm font-medium">Note:</Text>
              <Text className="text-text-secondary text-sm">
                Additional charges may apply for hard-to-reach installations or specialized equipment.
              </Text>
            </View>
          </View>
        </View>

        {/* Liability Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">6. Liability Limitations</Text>
          </View>
          
          <View className="bg-ui-card rounded-xl p-4 border border-ui-border">
            <Text className="text-text-secondary mb-3">
              Our liability is limited to the service cost paid. We are not responsible for:
            </Text>
            <Text className="text-text-secondary mb-2">• Pre-existing damage to your AC unit</Text>
            <Text className="text-text-secondary mb-2">• Manufacturing defects</Text>
            <Text className="text-text-secondary mb-2">• Damage from improper usage</Text>
            <Text className="text-text-secondary">• Power surges or electrical issues</Text>
          </View>
        </View>

        {/* Safety Protocols */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-1 h-6 bg-primary-sage rounded-full mr-2" />
            <Text className="text-text-primary font-bold text-lg">7. Safety Measures</Text>
          </View>
          
          <View className="bg-ui-card rounded-xl p-4 border border-ui-border">
            <Text className="flex-row items-center mb-2">
              <Text className="text-primary-sage mr-2">🔧</Text>
              <Text className="text-text-secondary">Technicians carry ID cards</Text>
            </Text>
            <Text className="flex-row items-center mb-2">
              <Text className="text-primary-sage mr-2">🧤</Text>
              <Text className="text-text-secondary">Safety gear is mandatory</Text>
            </Text>
            <Text className="flex-row items-center mb-2">
              <Text className="text-primary-sage mr-2">📸</Text>
              <Text className="text-text-secondary">Work completion photos shared</Text>
            </Text>
            <Text className="flex-row items-center">
              <Text className="text-primary-sage mr-2">🧹</Text>
              <Text className="text-text-secondary">Work area cleaned after service</Text>
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
       

        {/* Footer Note */}
        <View className="items-center mb-4">
          <Text className="text-text-tertiary text-xs text-center">
            For questions, contact our support at{'\n'}
            <Text className="text-primary-sage font-medium">support@acservice.com</Text> or call{' '}
            <Text className="text-primary-sage font-medium">+91 98765 43210</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default TermsConditions