//! The framebuffer is quantized in Rust, before GPUI uploads it to the GPU.

const BAYER: [[f32; 4]; 4] = [
    [0.0, 8.0, 2.0, 10.0],
    [12.0, 4.0, 14.0, 6.0],
    [3.0, 11.0, 1.0, 9.0],
    [15.0, 7.0, 13.0, 5.0],
];

#[derive(Clone, Copy, PartialEq)]
pub enum Algorithm {
    Bayer,
    FloydSteinberg,
}

/// Returns quantized luminance. Error diffusion uses a separate work buffer so
/// switching algorithms never damages the original image.
pub fn quantize(source: &[u8], width: usize, levels: u8, algorithm: Algorithm) -> Vec<u8> {
    assert!(width > 0 && source.len().is_multiple_of(width));
    assert!(levels >= 2);
    let steps = (levels - 1) as f32;
    let height = source.len() / width;
    let mut output = vec![0; source.len()];
    let mut work: Vec<f32> = source.iter().map(|&v| v as f32 / 255.0).collect();
    for y in 0..height {
        for x in 0..width {
            let i = y * width + x;
            let value = match algorithm {
                Algorithm::Bayer => {
                    let threshold = (BAYER[y % 4][x % 4] + 0.5) / 16.0 - 0.5;
                    (work[i] * steps + threshold).round().clamp(0.0, steps) / steps
                }
                Algorithm::FloydSteinberg => {
                    let old = work[i].clamp(0.0, 1.0);
                    let new = (old * steps).round() / steps;
                    let error = old - new;
                    if x + 1 < width {
                        work[i + 1] += error * 7.0 / 16.0;
                    }
                    if y + 1 < height {
                        if x > 0 {
                            work[i + width - 1] += error * 3.0 / 16.0;
                        }
                        work[i + width] += error * 5.0 / 16.0;
                        if x + 1 < width {
                            work[i + width + 1] += error / 16.0;
                        }
                    }
                    new
                }
            };
            output[i] = (value * 255.0).round() as u8;
        }
    }
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn endpoints_stay_black_and_white_in_both_algorithms() {
        for algorithm in [Algorithm::Bayer, Algorithm::FloydSteinberg] {
            for levels in [2, 4] {
                assert_eq!(quantize(&[0; 16], 4, levels, algorithm), vec![0; 16]);
                assert_eq!(quantize(&[255; 16], 4, levels, algorithm), vec![255; 16]);
            }
        }
    }

    #[test]
    fn bayer_has_half_coverage_at_midgray() {
        let output = quantize(&[128; 16], 4, 2, Algorithm::Bayer);
        assert_eq!(output.iter().filter(|&&v| v == 255).count(), 8);
    }

    #[test]
    fn diffusion_preserves_average_luminance_and_source() {
        let source = vec![128; 64 * 64];
        let output = quantize(&source, 64, 2, Algorithm::FloydSteinberg);
        let average = output.iter().map(|&v| v as f32).sum::<f32>() / output.len() as f32;
        assert!((average - 128.0).abs() < 2.0);
        assert_eq!(source, vec![128; 64 * 64]);
        assert!(output.iter().all(|&v| v == 0 || v == 255));
    }

    #[test]
    fn two_bit_output_uses_only_four_levels() {
        let source: Vec<u8> = (0..=255).collect();
        for algorithm in [Algorithm::Bayer, Algorithm::FloydSteinberg] {
            let output = quantize(&source, 16, 4, algorithm);
            assert!(output.iter().all(|v| [0, 85, 170, 255].contains(v)));
        }
    }
}
