#-----------------------------------------------------------------------------------
# 파일명        : app_control.py
# 설명          : 운영체제(macOS, Windows, Linux)에 따라
#                 지정된 애플리케이션을 실행(open_app)하거나
#                 종료(close_app)하는 유틸리티 스크립트
# 주요 기능     :
#   1) open_app(app_name): 앱 이름을 받아 해당 OS 전용 명령으로 실행
#   2) close_app(app_name): 앱 이름(또는 프로세스명)을 받아 종료
# 요구 모듈     : subprocess, platform
#-----------------------------------------------------------------------------------

import subprocess
import platform

def open_app(app_name):
    system_os = platform.system()

    if system_os == "Darwin":  
        subprocess.call(["open", "-a", app_name])
        
    elif system_os == "Windows":
        subprocess.call(["start", app_name], shell=True)
        
    elif system_os == "Linux":
        subprocess.call([app_name])

def close_app(app_name):
    system_os = platform.system()

    if system_os == "Darwin":  
        subprocess.call(["osascript", "-e", f'quit app "{app_name}"'])
        
    elif system_os == "Windows":
        subprocess.call(["taskkill", "/IM", f"{app_name}.exe", "/F"])
        
    elif system_os == "Linux":
        subprocess.call(["pkill", app_name])

if __name__ == "__main__":
    open_app("Google Chrome")
    # close_app("Google Chrome")