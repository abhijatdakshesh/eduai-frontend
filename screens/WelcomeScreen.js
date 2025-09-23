import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Improved responsive design for monitor and laptop screens
const getResponsiveLayout = () => {
  const screenWidth = width;
  const maxContentWidth = 1200; // Increased for larger screens
  
  // Better breakpoints for different screen sizes
  let contentWidth, featureCols, cardWidth;
  
  if (screenWidth >= 1400) {
    // Large monitor screens
    contentWidth = Math.min(screenWidth, maxContentWidth);
    featureCols = 3;
    cardWidth = (contentWidth - 60 - 24) / 3; // 30px padding each side, 24px total gap
  } else if (screenWidth >= 1024) {
    // Laptop screens
    contentWidth = Math.min(screenWidth, 1000);
    featureCols = 3;
    cardWidth = (contentWidth - 48 - 20) / 3; // 24px padding each side, 20px total gap
  } else if (screenWidth >= 768) {
    // Tablet screens
    contentWidth = Math.min(screenWidth, 800);
    featureCols = 2;
    cardWidth = (contentWidth - 40 - 16) / 2; // 20px padding each side, 16px total gap
  } else {
    // Mobile screens
    contentWidth = screenWidth;
    featureCols = 1;
    cardWidth = contentWidth - 32; // 16px padding each side
  }
  
  return {
    contentWidth,
    featureCols,
    cardWidth: Math.max(cardWidth, 250), // Increased minimum card width
    horizontalGap: 12
  };
};

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Get responsive layout values
  const layout = getResponsiveLayout();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: !isWeb,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleAdminLogin = () => {
    navigation.navigate('AdminLogin');
  };

  const handleTeacherLogin = () => {
    navigation.navigate('TeacherLogin');
  };

  const handleParentLogin = () => {
    navigation.navigate('ParentLogin');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View 
              style={[
                styles.logoCircle,
                {
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.logoIcon}>🎓</Text>
            </Animated.View>
          </View>
          
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.appName}>EdAI</Text>
          <Text style={styles.subtitle}>
            Your Complete Academic Management Solution
          </Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View 
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.featuresTitle}>What We Offer</Text>
          
          <View style={[styles.featuresGrid, { width: layout.contentWidth }]}>
            <View style={[styles.featureCard, { width: layout.cardWidth }]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📚</Text>
              </View>
              <Text style={styles.featureTitle}>Course Management</Text>
              <Text style={styles.featureDescription}>
                Access your courses, materials, and assignments
              </Text>
            </View>

            <View style={[styles.featureCard, { width: layout.cardWidth }]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📊</Text>
              </View>
              <Text style={styles.featureTitle}>Attendance Tracking</Text>
              <Text style={styles.featureDescription}>
                Monitor Real Time Attendance and Progress Reports
              </Text>
            </View>

            <View style={[styles.featureCard, { width: layout.cardWidth }]}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📈</Text>
              </View>
              <Text style={styles.featureTitle}>Internship & Job Portal</Text>
              <Text style={styles.featureDescription}>
                Apply for Internships & Off-Campus Jobs with your GPA and performance analytics
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.buttonSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Main Login/Signup */}
          <View style={styles.mainButtons}>
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                style={styles.buttonGradient}
              >
                <Text style={styles.loginButtonText}>🎓 Student Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.signupButton]}
              onPress={handleSignup}
              activeOpacity={0.8}
            >
              <View style={styles.signupButtonContent}>
                <Text style={styles.signupButtonText}>✨ Student Signup</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Role-specific Login Buttons */}
          <View style={styles.roleButtons}>
            <Text style={styles.roleSectionTitle}>Other Access Options</Text>
            
            <View style={styles.roleButtonsGrid}>
              <TouchableOpacity
                style={[styles.roleButton, styles.teacherButton]}
                onPress={handleTeacherLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.roleButtonIcon}>👨‍🏫</Text>
                <Text style={styles.roleButtonText}>Teacher</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.parentButton]}
                onPress={handleParentLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.roleButtonIcon}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.roleButtonText}>Parent</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.adminButton]}
                onPress={handleAdminLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.roleButtonIcon}>⚙️</Text>
                <Text style={styles.roleButtonText}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.footerText}>
            Connecting Education, Empowering Growth
          </Text>
          <Text style={styles.footerSubtext}>
            © 2024 Raycraft Technologies. All rights reserved.
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    ...(isWeb && {
      width: '100%',
      maxWidth: '100vw',
      overflow: 'auto',
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 40,
    ...(isWeb && {
      maxWidth: '100%',
      boxSizing: 'border-box',
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 960,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    marginBottom: 6,
    letterSpacing: 1,
  },
  appName: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
    maxWidth: 260,
  },
  featuresSection: {
    marginBottom: 30,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 960,
  },
  featuresTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 280,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  buttonSection: {
    marginBottom: 30,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
  },
  mainButtons: {
    marginBottom: 20,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    letterSpacing: 0.5,
  },
  signupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  signupButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  roleButtons: {
    marginBottom: 20,
  },
  roleSectionTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  roleButtonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  roleButton: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  roleButtonIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  teacherButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  parentButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.25)',
    borderColor: 'rgba(255, 152, 0, 0.5)',
  },
  adminButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.25)',
    borderColor: 'rgba(156, 39, 176, 0.5)',
  },
  footer: {
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 960,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6,
  },
  footerSubtext: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WelcomeScreen;
