; -*- mode: clojure -*-

;; Slot Access

(def slot-access (js-object "a" 1 "b" 2))

(is (identical? 2 (slot-get slot-access 'b)))
(is (identical? 2 (slot-get slot-access :b)))
(is (identical? 2 (slot-get slot-access 'b)))
(is (identical? 1 (slot-get slot-access :a)))
(is (nil? (slot-get slot-access :c)))

(slot-set! slot-access :c 3)
(is (identical? 3 (slot-get slot-access :c)))

(is (slot? slot-access :a))
(is (not (slot? slot-access :d)))

;; Instantiation

(def object (new js/Date 2025 1 2))

(is (function? (slot-get object :getYear)))
(is (function? (slot-get object :getMonth)))
(is (function? (slot-get object :getDay)))

;; Message Passing

(is (identical? 2025 (send object getFullYear)))

(send object (setYear 2020)) ;; let's go back in time
(is (identical? 2020 (send object getFullYear)))
