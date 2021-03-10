/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef} from 'react';
import {mobile} from "./utils";
import {DELETE_CONTENT_BACKWARD} from './constants'

function ReactInputDateMask({
                                mask = 'dd.mm.yyyy',
                                showMaskOnFocus = false,
                                showMaskOnHover = false,
                                value: inputValue = '',
                                className = '',
                                onChange = undefined,
                                disabled = false,
                                readOnly = false
                            }) {
    const [value, setValue] = useState('')
    const [toggleCursor, setCursor] = useState(false)
    const [positionCursor, setPosCursor] = useState({
        start: 0,
        end: 1,
    })
    const [letterObject, setLetterObject] = useState({})
    const [moveCursor, setMoveCursor] = useState({
        start: '',
        end: ''
    })
    const [maskOnFocus, setMaskOnFocus] = useState(false)
    const [statePlaceholder, setStatePlaceholder] = useState('')
    const myRef = useRef(null);

    useEffect(() => {
        myRef.current.setSelectionRange(positionCursor.start, positionCursor.end)
    }, [positionCursor.start, positionCursor.end, toggleCursor])

    useEffect(() => {
        myRef.current.setSelectionRange(moveCursor.start, moveCursor.end)
    }, [moveCursor.start, moveCursor.end])

    useEffect(() => {
        const value = inputValue ? inputValue : mask
        const valueObject = createObject(value)
        setValue(valueObject)
        if (!showMaskOnFocus || inputValue) setMaskOnFocus(true)
    }, [inputValue, showMaskOnFocus])

    useEffect(() => {
        const letterObject = createObject(mask)
        setLetterObject(letterObject)
        myRef.current.setSelectionRange(0, 1)
    }, [mask])

    const onFocus = (e) => {
        if (showMaskOnFocus && !maskOnFocus) {
            setMaskOnFocus(true)
            setStatePlaceholder('')
        }

    }

    const findDigitsOrLettersInValue = ({value, looking}) => {
        const separator = value['3']
        const regex = {
            digits: /[0-9]/g,
            letters: /[mMyYdD]/
        }
        const resultArray = Object.values(value).filter(el => el !== separator).map((el) => el.search(regex[looking])).filter(el => el === 0)
        return resultArray.length
    }

    const isCurrValueHaveDigits = (currValue) => {
        const quantityDigits = findDigitsOrLettersInValue({value: currValue, looking: 'digits'})
        const resultIndexLetters = Object.values(currValue).findIndex(el => {
            const regex = /[mMyYdD]/
            const result = el.search(regex)
            return result === 0
        })
        const quantityLetters = findDigitsOrLettersInValue({value: currValue, looking: 'letters'})
        return {
            allDigits: Boolean(quantityDigits === 8),
            indexLetter: resultIndexLetters,
            allLetters: Boolean(quantityLetters === 8)
        }
    }

    const trackingCursorPos = (e) => {
        const {allDigits, indexLetter} = isCurrValueHaveDigits(value)
        let {selectionStart} = e.target;
        if (allDigits) {
            if (positionCursor.start !== selectionStart) {
                setPosCursor({
                    ...positionCursor,
                    start: selectionStart,
                    end: selectionStart + 1
                })
            }

        } else if (indexLetter || indexLetter === 0) {
            setPosCursor({
                ...positionCursor,
                start: indexLetter,
                end: indexLetter + 1
            })
            setCursor(!toggleCursor)

        } else {
            setCursor(!toggleCursor)
        }
    }

    const onClick = (e) => {
        trackingCursorPos(e)
    }

    const onTouchStart = (e) => {
        trackingCursorPos(e)
    }

    const checkOneValue = (val, valueString, position) => {
        const regex = {
            d: /([0-3]d)|(0[1-9]|[12][0-9]|3[01])|(d[0-9])/,
            m: /([0-1]m)|(0[1-9]|1[012])|(m[0-2])/,
            y: /([1-2]yyy)|((19|20)yy)|((19|20)\dy)|((19|20)\d\d)|(y{2,3}\d{1,2})|(yy\dy)|([1-2]y\d{1,2})/,
            '/': /\//,
            '.': /\./
        }
        const letter = letterObject[position]
        let newVal;
        if (letter === "d") {
            newVal = mask === 'dd.mm.yyyy' || mask === 'dd/mm/yyyy' ? valueString.slice(0, 2) : valueString.slice(3, 5)
        } else if (letter === "m") {
            newVal = mask === 'dd.mm.yyyy' || mask === 'dd/mm/yyyy' ? valueString.slice(3, 5) : valueString.slice(0, 2)
        } else if (letter === "y") {
            newVal = valueString.slice(6, 10)
        } else {
            if (position === 3) {
                newVal = valueString.slice(2, 3)
            } else {
                newVal = valueString.slice(5, 6)
            }

        }
        const isMatch = regex[letter].test(newVal)
        return isMatch
    }

    const createObject = (string) => {
        let newObject = {};
        [...string].forEach(((el, index) => {
            newObject[index + 1] = el
        }))
        return newObject;
    }

    const onInput = (e) => {
        let {target: {selectionStart, selectionEnd, value: curValue}, nativeEvent: {inputType}} = e;
        if (mobile && inputType === DELETE_CONTENT_BACKWARD) {
            selectionStart += 1;
            deletingElement({pos: selectionStart, currentValue: value})
        } else {
            const valueArray = [...curValue];
            const newPositionStart = selectionStart - 1;
            const newValue = valueArray[newPositionStart]
            const reg = /[\d]/g;
            const isValidValue = reg.test(newValue)
            let newState;
            if (isValidValue && selectionStart < 11) {
                const valueString = Object.values({...value, [selectionStart]: newValue}).join('');
                const isMatch = checkOneValue(newValue, valueString, selectionStart)
                if (isMatch) {
                    newState = {...value, [selectionStart]: newValue};
                    setValue(newState)
                    const newSelectionStart = (selectionStart === 2 || selectionStart === 5) ? selectionStart + 1 : selectionStart
                    const newSelectionEnd = (selectionStart === 2 || selectionStart === 5) ? selectionEnd + 2 : selectionEnd + 1
                    setPosCursor({
                        ...positionCursor,
                        start: newSelectionStart,
                        end: newSelectionEnd
                    })
                } else {
                    if (selectionStart === 1 || selectionStart === 4) {
                        const nextValue = selectionStart + 1;
                        const newPosStart = selectionStart + 2;
                        newState = {
                            ...value,
                            [selectionStart]: '0',
                            [nextValue]: newValue
                        }
                        setValue(newState)
                        setPosCursor({
                            ...positionCursor,
                            start: newPosStart,
                            end: newPosStart + 1,
                        })
                    } else if (selectionStart === 7) {
                        const nextValue = selectionStart + 2;
                        const nextSelStart = selectionStart + 1;
                        newState = {
                            ...value,
                            [selectionStart]: '2',
                            [nextSelStart]: '0',
                            [nextValue]: newValue
                        }
                        setValue(newState)
                        setPosCursor({
                            ...positionCursor,
                            start: nextValue,
                            end: nextValue + 1
                        })
                    } else if (selectionStart === 3 || selectionStart === 6) {
                        const nextSelStart = selectionStart;
                        setPosCursor({
                            ...positionCursor,
                            start: nextSelStart,
                            end: nextSelStart + 1
                        })

                    } else {
                        newState = {...value}
                        setCursor(!toggleCursor)
                    }
                }
            } else {
                newState = {...value}
                setCursor(!toggleCursor)
            }

            onChange?.(Object.values(newState).join(''))
        }
    }

    const deletingElement = ({pos, currentValue}) => {
        const newValue = letterObject[pos];
        let newState = {
            ...currentValue,
            [pos]: newValue
        }
        setValue(newState)
        const newStart = pos - 1;
        const newEnd = newStart + 1
        setPosCursor((prevState) => {
            return {
                ...prevState,
                start: newStart,
                end: newEnd
            }
        })
        onChange?.(Object.values(newState).join(''))
    }

    const onKeyDown = (e) => {
        const {key, target: {selectionStart}} = e;
        if (key === "Backspace" || key === "Delete") {
            if (selectionStart !== 0) {
                e.preventDefault()
                deletingElement({pos: selectionStart, currentValue: value})
            } else {
                e.preventDefault()
            }

        } else if (key === 'ArrowRight' || key === 'ArrowLeft') {
            let newStart = key === 'ArrowRight' ? selectionStart + 1 : selectionStart - 1;
            const newEnd = key === 'ArrowRight' ? selectionStart + 2 : newStart + 1;
            setMoveCursor({
                ...moveCursor,
                start: newStart,
                end: newEnd
            })

        }
    }

    const onHandlePaste = ({target: {selectionStart}, clipboardData}) => {
        const pasteRaw = (clipboardData || window.clipboardData).getData('text');
        const paste = pasteRaw.length <= 10 ? pasteRaw : pasteRaw.slice(0, 10)
        const valueString = Object.values(value).join('')
        const prevValue = valueString.slice(0, selectionStart)
        const postValue = valueString.slice(selectionStart + paste.length)
        let pos = selectionStart;
        let newValueObject = {...value};
        let arrayValue = [];
        [...paste].forEach((el, index) => {
            pos += 1
            newValueObject[pos] = el
            const isMatch = checkOneValue(el, Object.values(newValueObject).join(''), pos)
            if (isMatch) {
                arrayValue.push(el)
            } else {
                newValueObject[pos] = letterObject[pos]
                arrayValue.push(letterObject[pos])
            }
        })
        const newValueString = [prevValue, ...arrayValue, postValue].join('')
        setValue({
            ...value,
            ...createObject(newValueString)
        })

    }

    const onHandleMouseEnter = (e) => {
        const {allLetters} = isCurrValueHaveDigits(value)
        if (allLetters && showMaskOnHover && statePlaceholder === '' && !maskOnFocus) {
            setStatePlaceholder(mask)
        }
    }

    const onHandleMouseLeave = (e) => {
        const {allLetters} = isCurrValueHaveDigits(value)
        if (allLetters && showMaskOnHover && statePlaceholder && !maskOnFocus) {
            setStatePlaceholder('')
        }
    }

    const onHandleBlur = (e) => {
        const {allLetters} = isCurrValueHaveDigits(value)
        if (allLetters && showMaskOnFocus && maskOnFocus) {
            setMaskOnFocus(false)
        }
    }

    const newState = Object.keys(value)?.length > 0 ? Object.values(value).join('') : value
    return (
        <input ref={myRef} placeholder={statePlaceholder} type='tel'
               onClick={onClick} className={className} spellCheck="false" onInput={onInput} onTouchStart={onTouchStart}
               onFocus={onFocus} value={maskOnFocus ? newState : ''} onKeyDown={onKeyDown}
               autoComplete='off' onPaste={onHandlePaste} onMouseEnter={onHandleMouseEnter}
               onMouseLeave={onHandleMouseLeave} onBlur={onHandleBlur} disabled={disabled} readOnly={readOnly}></input>
    )
}

export {ReactInputDateMask as default}






