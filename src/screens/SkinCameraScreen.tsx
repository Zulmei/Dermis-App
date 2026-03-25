// src/screens/SkinCameraScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';
import { Button } from '../components';
import { skinTypeColor, skinTypeName } from '../utils/format';
import {
  extractPixelFromPng,
  rgbToLab,
  calcITA,
  itaToFitzpatrick,
  checkBrightness,
} from '../utils/skinAnalysis';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props { navigation: NativeStackNavigationProp<any> }

type Phase = 'preview' | 'loading' | 'result' | 'error';

const SKIN_TYPES: Record<number, string> = {
  1: 'Very fair skin, always burns',
  2: 'Fair skin, burns easily',
  3: 'Medium skin, sometimes burns',
  4: 'Olive skin, rarely burns',
  5: 'Brown skin, very rarely burns',
  6: 'Dark skin, almost never burns',
};

export function SkinCameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase]               = useState<Phase>('preview');
  const [detectedType, setDetectedType] = useState<number | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string>('');
  const cameraRef = useRef<CameraView>(null);

  // ── Permission not yet determined ───────────────────────────────────────
  if (!permission) {
    return <View style={styles.root} />;
  }

  // ── Permission denied ───────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.root}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDesc}>
            We need camera access to analyze your skin tone. No photos are saved or uploaded.
          </Text>
          <Button label="Allow Camera" onPress={requestPermission} style={{ marginTop: Spacing.xl }} />
          <Button label="Choose Manually" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: Spacing.md }} />
        </View>
      </View>
    );
  }

  // ── Capture handler ─────────────────────────────────────────────────────
  const handleCapture = async () => {
    if (!cameraRef.current || phase !== 'preview') return;
    setPhase('loading');

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      if (!photo) throw new Error('No photo captured');

      // Crop center 40% square, then resize to 1×1 for average color
      const cropSize  = Math.min(photo.width, photo.height) * 0.4;
      const originX   = (photo.width  - cropSize) / 2;
      const originY   = (photo.height - cropSize) / 2;

      const result = await manipulateAsync(
        photo.uri,
        [
          { crop: { originX, originY, width: cropSize, height: cropSize } },
          { resize: { width: 1, height: 1 } },
        ],
        { format: SaveFormat.PNG, base64: true },
      );

      if (!result.base64) throw new Error('No base64 output from manipulator');

      const [r, g, b]      = extractPixelFromPng(result.base64);
      const [L, , bStar]   = rgbToLab(r, g, b);
      const brightnessCheck = checkBrightness(L);

      if (brightnessCheck === 'too_dark') {
        setErrorMsg('Too dark — move to a brighter area and try again.');
        setPhase('error');
        return;
      }
      if (brightnessCheck === 'too_bright') {
        setErrorMsg('Too bright — avoid direct sunlight and try again.');
        setPhase('error');
        return;
      }

      const ita  = calcITA(L, bStar);
      const type = itaToFitzpatrick(ita);
      setDetectedType(type);
      setPhase('result');
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.');
      setPhase('error');
    }
  };

  const handleUseThis = () => {
    navigation.navigate('OnboardingSkin', { detectedSkinType: detectedType });
  };

  const handleRetry = () => {
    setErrorMsg('');
    setDetectedType(null);
    setPhase('preview');
  };

  const col = detectedType ? skinTypeColor(detectedType) : Colors.teal;

  return (
    <View style={styles.root}>
      {/* ── Camera preview (always rendered so it stays ready) ── */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* ── Dark overlay with oval cutout guide ── */}
      {(phase === 'preview' || phase === 'loading') && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Top mask */}
          <View style={[styles.maskStrip, { flex: 1.2 }]} />
          {/* Middle row: side masks + oval window */}
          <View style={styles.maskRow}>
            <View style={[styles.maskStrip, { flex: 1 }]} />
            <View style={styles.ovalWindow} />
            <View style={[styles.maskStrip, { flex: 1 }]} />
          </View>
          {/* Bottom mask */}
          <View style={[styles.maskStrip, { flex: 2 }]} />
        </View>
      )}

      {/* ── Preview UI ── */}
      {phase === 'preview' && (
        <>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Point at your inner wrist</Text>
            <Text style={styles.instructionsSub}>Use natural or indoor light — avoid direct sunlight</Text>
          </View>

          {/* Capture button */}
          <View style={styles.captureArea}>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.8}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Loading overlay ── */}
      {phase === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={styles.loadingText}>Analyzing skin tone…</Text>
        </View>
      )}

      {/* ── Result bottom sheet ── */}
      {phase === 'result' && detectedType !== null && (
        <View style={styles.sheet}>
          <LinearGradient colors={[Colors.navyCard, Colors.navyMid]} style={styles.sheetInner}>
            {/* Swatch + type info */}
            <View style={styles.resultRow}>
              <LinearGradient
                colors={[`${col}80`, col]}
                style={[styles.resultSwatch, { shadowColor: col }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.detectedLabel}>Detected</Text>
                <Text style={[styles.detectedType, { color: col }]}>
                  Type {detectedType}
                </Text>
                <Text style={styles.detectedDesc}>{SKIN_TYPES[detectedType]}</Text>
              </View>
            </View>

            <Text style={styles.accuracyNote}>
              This is an estimate based on your photo. Lighting affects accuracy.
            </Text>

            <Button label="Use This" onPress={handleUseThis} style={{ marginTop: Spacing.lg }} />
            <Button
              label="Choose Manually"
              variant="ghost"
              onPress={() => navigation.goBack()}
              style={{ marginTop: Spacing.sm }}
            />
          </LinearGradient>
        </View>
      )}

      {/* ── Error bottom sheet ── */}
      {phase === 'error' && (
        <View style={styles.sheet}>
          <LinearGradient colors={[Colors.navyCard, Colors.navyMid]} style={styles.sheetInner}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorMsg}>{errorMsg}</Text>
            <Button label="Try Again" onPress={handleRetry} style={{ marginTop: Spacing.lg }} />
            <Button
              label="Choose Manually"
              variant="ghost"
              onPress={() => navigation.goBack()}
              style={{ marginTop: Spacing.sm }}
            />
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const OVAL_SIZE = 220;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.navy },

  // Permission screen
  permissionBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl3,
  },
  permissionIcon:  { fontSize: 48, marginBottom: Spacing.lg },
  permissionTitle: { fontSize: FontSizes.xl2, fontWeight: FontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  permissionDesc:  { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  // Oval guide mask
  maskStrip: { backgroundColor: 'rgba(0,0,0,0.55)' },
  maskRow:   { flexDirection: 'row', height: OVAL_SIZE },
  ovalWindow: {
    width: OVAL_SIZE, height: OVAL_SIZE,
    borderRadius: OVAL_SIZE / 2,
    borderWidth: 2, borderColor: Colors.teal,
  },

  // Back button
  backBtn: {
    position: 'absolute', top: 56, left: Spacing.xl2,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 26, color: Colors.textPrimary, lineHeight: 32, marginLeft: -2 },

  // Instructions
  instructions: {
    position: 'absolute', top: 56, left: 0, right: 0,
    alignItems: 'center', paddingHorizontal: Spacing.xl3,
  },
  instructionsTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.textPrimary, textAlign: 'center' },
  instructionsSub:   { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xs },

  // Capture button
  captureArea: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3, borderColor: Colors.white ?? Colors.textPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  captureInner: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.textPrimary,
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,15,30,0.75)',
    alignItems: 'center', justifyContent: 'center', gap: Spacing.lg,
  },
  loadingText: { fontSize: FontSizes.md, color: Colors.textPrimary },

  // Bottom sheet (result + error)
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: Radii.xl3, borderTopRightRadius: Radii.xl3,
    overflow: 'hidden',
  },
  sheetInner: { padding: Spacing.xl2, paddingBottom: Spacing.xl5 },

  // Result card
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.md },
  resultSwatch: {
    width: 56, height: 56, borderRadius: Radii.xl,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  detectedLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  detectedType:  { fontSize: FontSizes.xl3, fontWeight: FontWeights.bold, marginTop: 2 },
  detectedDesc:  { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 2 },
  accuracyNote:  { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },

  // Error card
  errorIcon: { fontSize: 36, textAlign: 'center', marginBottom: Spacing.sm },
  errorMsg:  { fontSize: FontSizes.md, color: Colors.textPrimary, textAlign: 'center', lineHeight: 22 },
});
