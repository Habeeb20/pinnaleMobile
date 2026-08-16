import MyClasses from "@/components/more-screen/student/MyClasses"
import TestCBT from "@/components/more-screen/student/TestCBT"
import Profile from "@/components/more-screen/student/Profile"
import MyTransport from "@/components/more-screen/student/MyTransport"
import MyHostel from "@/components/more-screen/student/MyHostel"
import GroupChat from "@/components/more-screen/student/GroupChat"
import Timetable from "@/components/more-screen/student/Timetable"
import LibraryDashboard from "@/components/more-screen/student/Library"
export const MORE_SCREEN_REGISTRY:Record<string, React.ComponentType> = {
         "my-classes": MyClasses,
         "test-cbt": TestCBT,
         "profile": Profile,
         "hostel-info": MyHostel,
         "transport": MyTransport,
         "group-chat":GroupChat,
         "timetable": Timetable,
         "library":LibraryDashboard
    }