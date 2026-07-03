import sys
from PIL import Image

def remove_black_bg(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        # Check if the pixel is black (or very close to black)
        # item is (R, G, B, A)
        if item[0] <= tolerance and item[1] <= tolerance and item[2] <= tolerance:
            # Change all black (also shades of black) to transparent
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_black_bg("public/attached_logo.jpg", "public/logo.png")
    print("Done")
