import {  useAppDispatch, useAppSelector } from '../../store';
import { onLoadLock } from '../../store/explore/securitySlice';
import { useFingerId } from './useFingerId';
export const useSecurity = () => {
  
  const { isLocked } = useAppSelector(state => state.security)
  const dispatch = useAppDispatch();
  const {  authenticateUser } = useFingerId();
 
  const startUnlockingState = async() => {
    const res = await authenticateUser();
    if(res){
      dispatch(onLoadLock(false))
      return true;
    }
    return false;
  }

  const startLockingState = async() => {
    dispatch(onLoadLock(true))
  }
  const startUsingSuperPass = async() => {
    dispatch(onLoadLock(false))
  }
 
  return {
    
    startLockingState,
    startUnlockingState,
    startUsingSuperPass,

    isLocked
  }
}

