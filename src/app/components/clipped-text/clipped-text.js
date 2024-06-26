import React from 'react';
import {useToggle} from '~/helpers/data';
import cn from 'classnames';
import './clipped-text.scss';

function useIsClipped() {
    const ref = React.useRef();
    const [isClipped, setIsClipped] = useToggle(false);

    React.useEffect(() => {
        const {clientHeight, scrollHeight} = ref.current;

        setIsClipped(scrollHeight > clientHeight);
    });

    return [ref, isClipped];
}

function useReadMore() {
    const [isOpen, toggle] = useToggle();
    const rmText = isOpen ? 'Show less' : 'Read more';
    const style = isOpen ? {maxHeight: 'none'} : {};

    function toggleOnClick(event) {
        event.preventDefault();
        toggle();
    }

    return [style, rmText, toggleOnClick];
}

export default function ClippedText({children, className=''}) {
    const [ref, isClipped] = useIsClipped();
    const [style, rmText, toggle] = useReadMore();

    return (
        <React.Fragment>
            <div className={cn('clipped-text', className)} style={style} ref={ref}>
                {children}
            </div>
            {isClipped && <a href="#toggle" onClick={toggle}>{rmText}</a>}
        </React.Fragment>
    );
}
