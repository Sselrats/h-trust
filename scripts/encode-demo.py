import argparse
import glob
import imageio.v2 as imageio
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument('--frames', default='output/frames/frame-*.png')
parser.add_argument('--out-prefix', default='output/h-trust-demo-864')
parser.add_argument('--fps', type=int, default=10)
args = parser.parse_args()

frame_paths = sorted(glob.glob(args.frames))
frames = [imageio.imread(p) for p in frame_paths]
if not frames:
    raise SystemExit(f'No frames found for pattern: {args.frames}')

gif_path = f'{args.out_prefix}.gif'
mp4_path = f'{args.out_prefix}.mp4'

imageio.mimsave(gif_path, frames, fps=args.fps, loop=0)

writer = imageio.get_writer(mp4_path, fps=args.fps, codec='libx264')
for frame in frames:
    if frame.dtype != np.uint8:
        frame = frame.astype(np.uint8)
    writer.append_data(frame)
writer.close()

print(f'Created {gif_path} and {mp4_path}')
