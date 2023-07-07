import React from 'react';
import useUserContext from '~/contexts/user';
import {useLocation} from 'react-router-dom';
import cookie from '~/helpers/cookie';

const DISMISSED_KEY = 'renewal_dialog_dismissed';
// const YESTERDAY = Date.now() - 60 * 60 * 24 * 1000;

function useCookieKey(key) {
    return React.useReducer(
        (_, value) => {
            cookie.setKey(key, value);
            return value ? value : '0';
        },
        cookie.hash[key]
    );
}

function useDismissalCookie() {
    const [cookieValue, setCookieValue] = useCookieKey(DISMISSED_KEY);
    const clicked = React.useMemo(
        () => +Number(cookieValue) > 0,
        [cookieValue]
    );
    const {userModel} = useUserContext();
    const isFaculty = userModel?.accountsModel?.faculty_status === 'confirmed_faculty';
    const {pathname} = useLocation();
    const ready = React.useMemo(
        () => {
            if (pathname === '/renewal-form') {
                return false;
            }
            return !clicked && isFaculty;
        },
        [clicked, isFaculty, pathname]
    );
    const disable = React.useCallback(
        () => setCookieValue(Date.now().toString()),
        [setCookieValue]
    );

    // Dismiss upon navigation
    React.useEffect(
        () => {
            window.setTimeout(
                () => {
                    if (!clicked && pathname === '/renewal-form') {
                        disable();
                    }
                },
                10
            );
        },
        [pathname, disable, clicked]
    );

    return [ready, disable];
}

function AdoptionContentBase({children, disable}) {
    const {userModel} = useUserContext();
    const {first_name: name} = userModel || {};

    return (
        <div
          className="microsurvey-content"
          data-analytics-view
          data-analytics-nudge="adoption"
          data-nudge-placement="popup"
        >
            {children}
            <h1>
                Hi, {name}. Could you update our records
                of which books you&apos;re using?
                Fill out the <a
href="/renewal-form?from=popup"
                    onClick={() => disable()}
                    data-nudge-action="interacted"
                >form here</a>.
            </h1>
        </div>
    );
}

export default function useAdoptionMicrosurveyContent() {
    const [ready, disable] = useDismissalCookie();
    const AdoptionContent = React.useCallback(
        ({children}) => (
            <AdoptionContentBase disable={disable}>
                {children}
            </AdoptionContentBase>
        ),
        [disable]
    );

    return [ready, AdoptionContent];
}
