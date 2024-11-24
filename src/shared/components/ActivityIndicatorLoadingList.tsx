import { ActivityIndicator, View } from "react-native"
import { FC } from "react";
import { NoItemsInList } from "../views";
import { LoadingLogo } from "./LoadingLogo";


interface ActivityIndicatorLoadingListProps {
  isLoading: boolean
}
export const ActivityIndicatorLoadingList: FC<ActivityIndicatorLoadingListProps> = ({isLoading}) => {
  return (
    <>
    {
      isLoading ? (
        <View className="flex-1 items-center, justify-center">
          <LoadingLogo/>
        </View>
      ) : <NoItemsInList/>
    }
    </>
    
  )
}
