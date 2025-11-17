import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Gift, History, Settings, Shield, Users } from "lucide-react-native"
import type React from "react"
import { useEffect, useRef } from "react"
import { Animated, Dimensions, Image, Platform, Text, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

interface HeaderProps {
  variant: "home" | "rewards" | "history" | "profile" | "simple" | "page"
  title?: string
  subtitle?: string
  userName?: string
  showBackButton?: boolean
  onBackPress?: () => void
  rightComponent?: React.ReactNode
  stats?: {
    total?: number
    claimed?: number
    expiring?: number
    gamesPlayed?: number
  }
  showLogo?: boolean
}

export default function Header({
  variant = "page",
  title,
  subtitle,
  userName,
  showBackButton = false,
  onBackPress,
  rightComponent,
  stats,
  showLogo = false,
}: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  // HOME HEADER - Unique with logo and personalized greeting
  if (variant === "home") {
    // Animation refs for floating orbs
    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb1Scale = useRef(new Animated.Value(1)).current;
    const orb2Y = useRef(new Animated.Value(0)).current;
    const orb2Scale = useRef(new Animated.Value(1)).current;

    // Setup floating animations
    useEffect(() => {
      // Orb 1 - Slower, larger movement
      const orb1Animation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb1Y, {
              toValue: -15,
              duration: 3500,
              useNativeDriver: true,
              easing: (t) => t * (2 - t), // ease-out-quad for smooth deceleration
            }),
            Animated.timing(orb1Scale, {
              toValue: 1.05,
              duration: 3500,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb1Y, {
              toValue: 0,
              duration: 3500,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
            Animated.timing(orb1Scale, {
              toValue: 1,
              duration: 3500,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
          ]),
        ])
      );

      // Orb 2 - Faster, smaller movement (offset timing)
      const orb2Animation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb2Y, {
              toValue: 12,
              duration: 2800,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
            Animated.timing(orb2Scale, {
              toValue: 1.03,
              duration: 2800,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
          ]),
          Animated.parallel([
            Animated.timing(orb2Y, {
              toValue: 0,
              duration: 2800,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
            Animated.timing(orb2Scale, {
              toValue: 1,
              duration: 2800,
              useNativeDriver: true,
              easing: (t) => t * (2 - t),
            }),
          ]),
        ])
      );

      orb1Animation.start();
      orb2Animation.start();

      return () => {
        orb1Animation.stop();
        orb2Animation.stop();
      };
    }, []);

    return (
      <View style={{ position: "relative", overflow: "hidden" }}>
        {/* Dynamic Background with Teal Gradients */}
        <LinearGradient
          colors={["#009688", "#00BCD4", "#26A69A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Floating Orbs for Visual Interest */}
        <Animated.View
          style={{
            position: "absolute",
            top: -40,
            right: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            transform: [
              { translateY: orb1Y },
              { scale: orb1Scale },
            ],
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            bottom: -50,
            left: -40,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            transform: [
              { translateY: orb2Y },
              { scale: orb2Scale },
            ],
          }}
        />

        {/* Main Content - Made Bigger */}
        <View
          style={{
            paddingHorizontal: 28,
            paddingTop: 28,
            paddingBottom: 40,
            position: "relative",
            zIndex: 1,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left Content - Greeting */}
            <View style={{ flex: 1, paddingRight: 20 }}>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: 18,
                  fontWeight: "500",
                  marginBottom: 6,
                  letterSpacing: 0.5,
                }}
              >
                {getGreeting()}
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 32,
                  fontWeight: "800",
                  marginBottom: 12,
                  letterSpacing: -0.5,
                }}
              >
                {userName ? `${userName}!` : "Welcome back!"}
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="game-controller" size={20} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Ready to play?
                </Text>
              </View>
            </View>

            {/* Right Content - Logo with Liquid Glass Effect */}
            {showLogo && (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 24,
                  elevation: 18,
                }}
              >
                <BlurView
                  intensity={Platform.OS === "ios" ? 90 : 100}
                  tint="light"
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    borderRadius: 50,
                  }}
                >
                  {/* Subtle white overlay for extra depth */}
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.75)",
                      borderRadius: 50,
                    }}
                    pointerEvents="none"
                  />

                  <Image
                    source={require("../../../assets/OpenDoorsLogo.png")}
                    style={{ width: 80, height: 80, resizeMode: "contain", zIndex: 1 }}
                  />
                </BlurView>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Wave Effect - Made Bigger */}
        <View
          style={{
            position: "absolute",
            bottom: -3,
            left: 0,
            right: 0,
            height: 35,
            backgroundColor: "#F8F9FA",
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
          }}
        />
      </View>
    )
  }

  // REWARDS HEADER - Stats-focused with achievement feel
  if (variant === "rewards") {
    return (
      <View style={{ backgroundColor: "#F8F9FA" }}>
        <LinearGradient colors={["#009688", "#00796B"]} style={{ paddingBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 15 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}
            >
              {showBackButton && onBackPress && (
                <TouchableOpacity
                  onPress={onBackPress}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              )}

              <View
                style={{
                  flex: 1,
                  alignItems: showBackButton ? "center" : "flex-start",
                  paddingLeft: showBackButton ? 0 : 0,
                }}
              >
                <Text style={{ color: "white", fontSize: 32, fontWeight: "800" }}>Rewards</Text>
                <Text style={{ color: "#B2DFDB", fontSize: 16, marginTop: 2 }}>Your earned rewards</Text>
              </View>

              {rightComponent && <View style={{ width: 40 }}>{rightComponent}</View>}
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: -12,
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#009688" }}>{stats?.total || 0}</Text>
            <Text style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>Total{"\n"}Rewards</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#009688" }}>{stats?.claimed || 0}</Text>
            <Text style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>Already{"\n"}Claimed</Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#F59E0B" }}>{stats?.expiring || 0}</Text>
            <Text style={{ fontSize: 12, color: "#6B7280", textAlign: "center" }}>Expiring{"\n"}Soon</Text>
          </View>
        </View>
      </View>
    )
  }

  // HISTORY HEADER - Timeline/activity focused
  if (variant === "history") {
    return (
      <View style={{ backgroundColor: "#F8F9FA" }}>
        <LinearGradient colors={["#6366F1", "#4F46E5"]} style={{ paddingBottom: 20 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              {showBackButton && onBackPress && (
                <TouchableOpacity
                  onPress={onBackPress}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              )}

              <View style={{ flex: 1, alignItems: showBackButton ? "center" : "flex-start" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="time-outline" size={28} color="white" />
                  </View>
                  <View>
                    <Text style={{ color: "white", fontSize: 28, fontWeight: "800" }}>History</Text>
                    <Text style={{ color: "#C7D2FE", fontSize: 14 }}>Your gaming journey</Text>
                  </View>
                </View>
              </View>

              {rightComponent && <View style={{ width: 40 }}>{rightComponent}</View>}
            </View>
          </View>
        </LinearGradient>

        {/* Games Played Stat */}
        <View
          style={{
            alignItems: "center",
            marginTop: -10,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              paddingVertical: 16,
              paddingHorizontal: 32,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 32, fontWeight: "800", color: "#6366F1", textAlign: "center" }}>
              {stats?.gamesPlayed || 0}
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>Games Played</Text>
          </View>
        </View>
      </View>
    )
  }

  // PROFILE HEADER - Personal/settings focused
  if (variant === "profile") {
    return (
      <LinearGradient colors={["#EC4899", "#DB2777"]} style={{ paddingBottom: 20 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {showBackButton && onBackPress && (
              <TouchableOpacity
                onPress={onBackPress}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}

            <View style={{ flex: 1, alignItems: showBackButton ? "center" : "flex-start" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={32} color="white" />
                </View>
                <View>
                  <Text style={{ color: "white", fontSize: 28, fontWeight: "800" }}>Profile</Text>
                  <Text style={{ color: "#FBCFE8", fontSize: 14 }}>Manage your account and preferences</Text>
                </View>
              </View>
            </View>

            {rightComponent && <View style={{ width: 40 }}>{rightComponent}</View>}
          </View>
        </View>
      </LinearGradient>
    )
  }

  // SIMPLE HEADER - For other pages
  return (
    <View style={{ backgroundColor: "#F8F9FA", paddingBottom: 12 }}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#009688", "#00BCD4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingHorizontal: 28,
          paddingTop: 24,
          paddingBottom: 32,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Pattern Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.12,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 25,
              right: 45,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "white",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 55,
              right: 85,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "white",
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 40,
              left: 65,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Header Content */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Back Button */}
          {showBackButton && onBackPress && (
            <TouchableOpacity
              onPress={onBackPress}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 20,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
          )}

          {/* Title Section */}
          <View
            style={{
              flex: 1,
              alignItems: showBackButton ? "center" : "flex-start",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 36,
                fontWeight: "900",
                letterSpacing: -1,
                textAlign: showBackButton ? "center" : "left",
                marginBottom: 4,
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontSize: 18,
                  fontWeight: "500",
                  textAlign: showBackButton ? "center" : "left",
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Component */}
          {rightComponent && <View style={{ marginLeft: 20 }}>{rightComponent}</View>}
        </View>
      </LinearGradient>

      {/* Floating Card Effect - Made Bigger */}
      <View
        style={{
          marginHorizontal: 28,
          marginTop: -16,
          backgroundColor: "white",
          borderRadius: 24,
          paddingVertical: 20,
          paddingHorizontal: 24,
          shadowColor: "#009688",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.18,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(title === "Rewards" || title === "My Rewards") && <Gift size={20} color="#009688" style={{ marginRight: 12 }} />}
          {title === "History" && <History size={20} color="#009688" style={{ marginRight: 12 }} />}
          {title === "Distributor Dashboard" && <Users size={20} color="#009688" style={{ marginRight: 12 }} />}
          {title === "Admin Dashboard" && <Shield size={20} color="#009688" style={{ marginRight: 12 }} />}
          {title === "Profile" && <Settings size={20} color="#009688" style={{ marginRight: 12 }} />}
          {!["Rewards", "My Rewards", "History", "Distributor Dashboard", "Admin Dashboard", "Profile"].includes(title || "") && <Ionicons name="sparkles" size={20} color="#009688" style={{ marginRight: 12 }} />}
          <Text
            style={{
              color: "#009688",
              fontSize: 18,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            {(title === "Rewards" || title === "My Rewards") && "View and manage your earned rewards"}
            {title === "History" && "Track your game history and statistics"}
            {title === "Distributor Dashboard" && "Manage door distributions and track activity"}
            {title === "Admin Dashboard" && "Oversee distributors and monitor system activity"}
            {title === "Profile" && "Manage your account and preferences"}
            {!["Rewards", "My Rewards", "History", "Distributor Dashboard", "Admin Dashboard", "Profile"].includes(title || "") && "✨ Explore More"}
          </Text>
        </View>
      </View>
    </View>
  )
}
