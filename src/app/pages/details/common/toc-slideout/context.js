import buildContext from '~/components/jsx-helpers/build-context';
import {useToggle} from '~/components/jsx-helpers/jsx-helpers.jsx';

function useContextValue() {
    const [tocActive, toggleTocActive] = useToggle(false);

    return {
        isOpen: tocActive,
        toggle: toggleTocActive
    };
}

const {useContext, ContextProvider} = buildContext({useContextValue});

export {
    useContext as default,
    ContextProvider as TOCContextProvider
};
