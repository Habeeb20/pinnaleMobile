import MyClasses from "@/components/more-screen/student/MyClasses"
import TestCBT from "@/components/more-screen/student/TestCBT"
import Profile from "@/components/more-screen/student/Profile"
import MyTransport from "@/components/more-screen/student/MyTransport"
import MyHostel from "@/components/more-screen/student/MyHostel"
import GroupChat from "@/components/more-screen/student/GroupChat"
export const MORE_SCREEN_REGISTRY:Record<string, React.ComponentType> = {
         "my-classes": MyClasses,
         "test-cbt": TestCBT,
         "profile": Profile,
         "hostel-info": MyHostel,
         "transport": MyTransport,
         "group-chat":GroupChat
    }