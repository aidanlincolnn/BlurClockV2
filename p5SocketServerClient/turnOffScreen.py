import sys
sys.path.append("/home/aidan/.local/lib/python3.7/site-packages")
import subprocess
import psutil

process = psutil.Process(int(sys.argv[1]))
for proc in process.children(recursive=True):
    proc.kill()
process.kill() 
