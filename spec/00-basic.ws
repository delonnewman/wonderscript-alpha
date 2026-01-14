; -*- mode: clojure -*-

1
"This is a string"
[1 2 3]
[1, 2, 3]
'(1 2 3)
{:a 1, :b 2}

;; Exceptions

(throw "Hey!")

;; slot access
(is (nil? (slot js/global 'hey)))
(slot-set! js/global 'hey "You!")
(is (= "You!" (slot js/global 'hey)))
