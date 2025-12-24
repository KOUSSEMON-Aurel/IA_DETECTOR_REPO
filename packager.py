import zipfile
import os

def zip_directory(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Exclude hidden directories like .git
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.endswith('.zip') or file.startswith('.') or file == 'packager.py':
                    continue
                    
                file_path = os.path.join(root, file)
                
                # Firefox Packaging Logic:
                # 1. Skip standard manifest.json
                # 2. Rename manifest_firefox.json to manifest.json
                if file == 'manifest.json':
                    continue
                    
                if file == 'manifest_firefox.json':
                    zipf.write(file_path, 'manifest.json')
                    print(f"Adding manifest_firefox.json as manifest.json")
                    continue
                    
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname)
                print(f"Adding {arcname}")

if __name__ == "__main__":
    current_dir = os.getcwd()
    output_zip = os.path.join(current_dir, 'vibe_detector_firefox.zip')
    print(f"Zipping {current_dir} to {output_zip}...")
    zip_directory(current_dir, output_zip)
    print("Done!")
